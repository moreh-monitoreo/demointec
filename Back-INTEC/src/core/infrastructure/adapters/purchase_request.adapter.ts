import { NotFound, BadRequest } from "http-errors";
import { SelectQueryBuilder } from "typeorm";
import * as XLSX from "xlsx";
import database from "../../../config/db";
import {
  FullRequest,
  ItemSelection,
  PagedRequests,
  PurchaseRequestRepository,
  Query,
} from "../../domain/repository/purchase_request.repository";
import {
  AuthorizationData,
  CreateRequestData,
  CreateRequestItem,
  ProjectSummary,
  REQUEST_STATUS_PENDING,
  REQUEST_STATUS_SUPPLIED,
  REQUEST_TYPE_MATERIAL,
  REQUEST_TYPE_TOOL,
  SUPPLY_DELIVERED_VALUES,
  SUPPLY_STATUS_DELIVERED,
  SUPPLY_STATUS_PARTIAL,
  SUPPLY_STATUS_PENDING,
  RequestSummary,
  RequestTotals,
} from "../../domain/models/purchase_request";
import { RequestDetailsEntity } from "../entity/request_details.entity";
import { RequestHeadersEntity } from "../entity/request_headers.entity";
import { RequestsAdditionalEntity } from "../entity/requests_additional.entity";
import { FormatItem, buildRequestFormat } from "./purchase-request-format.helper";
import {
  ITEMS_SUBCOLLECTION,
  REQUESTS_COLLECTION,
  deleteRequestDocument,
  firestore,
  formatDate,
  itemDocumentId,
  normalizeDate,
  reserveFolio,
  toFirestoreHeader,
  toFirestoreItem,
} from "./request-firestore.helper";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export class PurchaseRequestAdapterRepository implements PurchaseRequestRepository {

  async listProjects(query: Query = {}): Promise<ProjectSummary[]> {
    const builder = database
      .getRepository(RequestHeadersEntity)
      .createQueryBuilder('header')
      .select('TRIM(UPPER(header.project))', 'project_key')
      .addSelect('MAX(header.project)', 'project')
      .addSelect('COUNT(*)', 'total')
      .addSelect('SUM(CASE WHEN header.supply_status = :pending THEN 1 ELSE 0 END)', 'pending')
      .addSelect('SUM(CASE WHEN header.supply_status = :partial THEN 1 ELSE 0 END)', 'partial')
      .addSelect('SUM(CASE WHEN header.supply_status IN (:...supplied) THEN 1 ELSE 0 END)', 'supplied')
      .addSelect('MAX(header.date)', 'last_date')
      .where('header.status = :active', { active: true })
      .setParameters({
        pending: SUPPLY_STATUS_PENDING,
        partial: SUPPLY_STATUS_PARTIAL,
        supplied: SUPPLY_DELIVERED_VALUES,
      })
      .groupBy('TRIM(UPPER(header.project))');

    this.applySupplyFilter(builder, query.estatus);

    if (query.buscar) {
      builder.andWhere('header.project LIKE :buscar', { buscar: `%${query.buscar}%` });
    }

    const rows = await builder.getRawMany();

    return rows
      .map((row) => ({
        project: row.project || '',
        total: Number(row.total) || 0,
        pending: Number(row.pending) || 0,
        partial: Number(row.partial) || 0,
        supplied: Number(row.supplied) || 0,
        last_date: row.last_date ? new Date(row.last_date) : null,
      }))
      .sort((a, b) => a.project.localeCompare(b.project));
  }

  async listByProject(project: string, query: Query = {}): Promise<PagedRequests> {
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(query.limit) || DEFAULT_LIMIT, 1), MAX_LIMIT);

    const builder = database
      .getRepository(RequestHeadersEntity)
      .createQueryBuilder('header')
      .where('header.status = :active', { active: true })
      .andWhere('TRIM(UPPER(header.project)) = :project_key', {
        project_key: String(project).trim().toUpperCase(),
      });

    this.applySupplyFilter(builder, query.estatus);

    if (query.buscar) {
      builder.andWhere(
        '(header.folio_request LIKE :buscar OR header.work LIKE :buscar OR header.requester LIKE :buscar OR header.locality LIKE :buscar)',
        { buscar: `%${query.buscar}%` }
      );
    }

    const total = await builder.getCount();

    const direction = String(query.direccion || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    if (query.orden === 'fecha') {
      builder.orderBy('header.date', direction);
    } else {
      builder.orderBy('CAST(header.folio_request AS UNSIGNED)', direction);
    }

    const headers = await builder
      .offset((page - 1) * limit)
      .limit(limit)
      .getMany();

    const totalsByFolio = await this.totalsByFolio(headers.map((header) => header.folio_request));

    const data: RequestSummary[] = headers.map((header) => {
      const totals = totalsByFolio.get(header.folio_request) || { concepts: 0, units: 0, amount: 0 };

      return {
        id_header: header.id_header,
        folio_request: header.folio_request,
        project: header.project,
        work: header.work,
        locality: header.locality,
        requester: header.requester,
        official: header.official,
        locationType: header.locationType,
        status_header: header.status_header,
        supply_status: header.supply_status || SUPPLY_STATUS_PENDING,
        request_type: header.request_type,
        authorized: this.isAuthorized(header),
        authorization_level: this.authorizationLevel(header),
        date: header.date,
        ...totals,
      };
    });

    return { data, total, page, limit };
  }

  async get(folio: string): Promise<FullRequest> {
    const header = await database.getRepository(RequestHeadersEntity).findOne({
      where: { folio_request: String(folio) },
    });

    if (!header) {
      throw new NotFound('No existe la solicitud con el folio proporcionado');
    }

    const [details, additional] = await Promise.all([
      database.getRepository(RequestDetailsEntity).find({
        where: { folio_request: String(folio), status: true },
        order: { id: 'ASC' },
      }),
      database.getRepository(RequestsAdditionalEntity).find({
        where: { folio_request: String(folio), status: true },
        order: { id: 'ASC' },
      }),
    ]);

    return { header, details, additional, totals: this.sumItems([...details, ...additional]) };
  }

  async create(data: CreateRequestData): Promise<FullRequest> {
    if (!data || !Array.isArray(data.items) || data.items.length === 0) {
      throw new BadRequest('La solicitud debe incluir al menos un concepto');
    }

    if (!data.header?.project) {
      throw new BadRequest('La solicitud debe indicar la obra');
    }

    const kind = data.kind === 'H' ? 'H' : 'M';
    const folio = await reserveFolio();
    const folioRequest = String(folio);
    const idHeader = `E${folioRequest}`;
    const idDetail = `D${folioRequest}`;
    const now = new Date();

    const header: Partial<RequestHeadersEntity> = {
      ...data.header,
      id_header: idHeader,
      folio_request: folioRequest,
      date: normalizeDate(data.header.date) || now,
      hour: data.header.hour || now.toTimeString().slice(0, 5),
      status_header: data.header.status_header || REQUEST_STATUS_PENDING,
      supply_status: data.header.supply_status || SUPPLY_STATUS_PENDING,
      request_type: kind === 'H' ? REQUEST_TYPE_TOOL : REQUEST_TYPE_MATERIAL,
      locationType: data.header.locationType || 'local',
      auth1: data.header.auth1 || '0',
      auth2: data.header.auth2 || '0',
      auth3: data.header.auth3 || '0',
      revision1: data.header.revision1 || '',
      revision2: data.header.revision2 || '',
      revision3: data.header.revision3 || '',
      revision_date1: data.header.revision_date1 || '',
      revision_date2: data.header.revision_date2 || '',
      revision_date3: data.header.revision_date3 || '',
      notes: data.header.notes || '',
      status: true,
    };

    const details = data.items.map((item) => this.buildDetail(item, kind, idDetail, folioRequest));

    const created = await database.transaction(async (manager) => {
      const savedHeader = await manager.save(RequestHeadersEntity, manager.create(RequestHeadersEntity, header));
      const savedDetails = await manager.save(
        RequestDetailsEntity,
        details.map((detail) => manager.create(RequestDetailsEntity, detail))
      );

      return { header: savedHeader, details: savedDetails };
    });

    try {
      await this.createOnFirestore(created.header, created.details);
    } catch (error) {
      await this.deleteFromDatabase(folioRequest);
      console.error('Error al replicar la solicitud en Firestore:', error);
      throw error;
    }

    return {
      header: created.header,
      details: created.details,
      additional: [],
      totals: this.sumItems(created.details),
    };
  }

  async remove(folio: string): Promise<RequestHeadersEntity> {
    const { header } = await this.get(folio);
    const folioRequest = String(folio);

    await database.transaction(async (manager) => {
      await manager.update(RequestHeadersEntity, { folio_request: folioRequest }, { status: false });
      await manager.update(RequestDetailsEntity, { folio_request: folioRequest }, { status: false });
      await manager.update(RequestsAdditionalEntity, { folio_request: folioRequest }, { status: false });
    });

    await Promise.all([
      deleteRequestDocument(`E${folioRequest}`),
      deleteRequestDocument(`D${folioRequest}`),
      deleteRequestDocument(`A${folioRequest}`),
    ]);

    return header;
  }

  async updateStatus(folio: string, status: string): Promise<RequestHeadersEntity> {
    const allowed = [SUPPLY_STATUS_PENDING, SUPPLY_STATUS_PARTIAL, ...SUPPLY_DELIVERED_VALUES];

    if (!allowed.includes(status)) {
      throw new BadRequest(`El estatus de surtido debe ser ${allowed.join(', ')}`);
    }

    const delivered = SUPPLY_DELIVERED_VALUES.includes(status);
    const { header } = await this.get(folio);

    if (delivered && !this.isAuthorized(header)) {
      throw new BadRequest('La solicitud necesita las tres autorizaciones para registrar el suministro');
    }

    const changes = {
      supply_status: delivered ? SUPPLY_STATUS_DELIVERED : status,
      status_header: delivered ? REQUEST_STATUS_SUPPLIED : REQUEST_STATUS_PENDING,
    };

    Object.assign(header, changes);

    await database.getRepository(RequestHeadersEntity).update({ id_header: header.id_header }, changes);
    await this.updateHeaderOnFirestore(header);

    return header;
  }

  async updateAuthorization(folio: string, data: AuthorizationData): Promise<RequestHeadersEntity> {
    const level = Number(data?.level);
    if (![1, 2, 3].includes(level)) {
      throw new BadRequest('El nivel de autorizacion debe ser 1, 2 o 3');
    }

    const { header } = await this.get(folio);
    const changes = {
      [`auth${level}`]: data.authorized ? '1' : '0',
      [`revision${level}`]: data.reviewer || '',
      [`revision_date${level}`]: data.authorized ? formatDate(new Date()) : '',
    } as unknown as Partial<RequestHeadersEntity>;

    Object.assign(header, changes);

    await database.getRepository(RequestHeadersEntity).update({ id_header: header.id_header }, changes);
    await this.updateHeaderOnFirestore(header);

    return header;
  }

  async exportToBuffer(query: Query = {}): Promise<Buffer> {
    const builder = database
      .getRepository(RequestHeadersEntity)
      .createQueryBuilder('header')
      .where('header.status = :active', { active: true });

    if (query.obra) {
      builder.andWhere('TRIM(UPPER(header.project)) = :project_key', {
        project_key: String(query.obra).trim().toUpperCase(),
      });
    }

    if (query.estatus) {
      builder.andWhere('header.status_header = :estatus', { estatus: query.estatus });
    }

    const headers = await builder
      .orderBy('header.project', 'ASC')
      .addOrderBy('CAST(header.folio_request AS UNSIGNED)', 'ASC')
      .getMany();

    const folios = headers.map((header) => header.folio_request);
    const totalsByFolio = await this.totalsByFolio(folios);
    const items = await this.itemsByFolio(folios);

    const requestRows = headers.map((header) => {
      const totals = totalsByFolio.get(header.folio_request) || { concepts: 0, units: 0, amount: 0 };

      return {
        Folio: header.folio_request,
        Obra: header.project,
        Trabajo: header.work,
        Localidad: header.locality,
        Ubicacion: header.locationType,
        Residente: header.requester,
        Oficial: header.official,
        Fecha: formatDate(header.date),
        Estatus: header.status_header,
        Conceptos: totals.concepts,
        Unidades: totals.units,
        Importe: Number(totals.amount.toFixed(2)),
        Notas: header.notes,
      };
    });

    const itemRows = items.map((item) => ({
      Folio: item.folio_request,
      Tipo: item.category1 === 'H' ? 'Herramienta' : 'Material',
      Concepto: item.name,
      Codigo: item.code,
      Unidad: item.unit,
      Cantidad: item.amount,
      CostoUnitario: Number(item.unit_cost) || 0,
      Importe: Number(((Number(item.amount) || 0) * (Number(item.unit_cost) || 0)).toFixed(2)),
      Partida: item.category,
      Subpartida: item.subcategory,
      Descripcion: item.description,
      Observaciones: item.observation,
    }));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(requestRows), 'Solicitudes');
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(itemRows), 'Conceptos');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  async exportFormat(folio: string, selection?: ItemSelection[], quotedBy?: string): Promise<Buffer> {
    const { header, details, additional } = await this.get(folio);

    const entries = [
      ...details.map((item) => ({ source: 'detail', item })),
      ...additional.map((item) => ({ source: 'additional', item })),
    ];

    const chosen = selection && selection.length > 0
      ? entries.filter((entry) => selection.some((pick) => pick.source === entry.source && Number(pick.id) === entry.item.id))
      : entries;

    if (chosen.length === 0) {
      throw new BadRequest('Debe seleccionar al menos un concepto para imprimir el formato');
    }

    const items: FormatItem[] = chosen.map(({ item }) => ({
      code: item.code,
      name: item.name,
      unit: item.unit,
      amount: item.amount,
      observation: item.observation,
    }));

    return buildRequestFormat({ ...header, quotedBy }, items);
  }

  private buildDetail(
    item: CreateRequestItem,
    kind: string,
    idDetail: string,
    folioRequest: string
  ): Partial<RequestDetailsEntity> {
    const isTool = kind === 'H';

    return {
      id_detail: idDetail,
      folio_request: folioRequest,
      name: item.name || '',
      amount: Number(item.amount) || 0,
      unit_cost: Number(item.unit_cost) || 0,
      unit: item.unit || (isTool ? 'PIEZA' : ''),
      code: item.code || '',
      c1: item.c1 || '',
      c2: item.c2 || '',
      description: item.description || '',
      observation: item.observation || '',
      category1: kind,
      category: item.category || (isTool ? 'HERRAMIENTAS' : ''),
      subcategory: item.subcategory || (isTool ? 'HERRAMIENTAS' : ''),
      status: true,
    };
  }

  private applySupplyFilter(
    builder: SelectQueryBuilder<RequestHeadersEntity>,
    status?: string
  ): void {
    if (!status) return;

    if (SUPPLY_DELIVERED_VALUES.includes(status)) {
      builder.andWhere('header.supply_status IN (:...delivered)', { delivered: SUPPLY_DELIVERED_VALUES });
      return;
    }

    builder.andWhere('header.supply_status = :estatus', { estatus: status });
  }

  private authorizationLevel(header: RequestHeadersEntity): number {
    return [header.auth1, header.auth2, header.auth3].filter((level) => String(level) === '1').length;
  }

  private isAuthorized(header: RequestHeadersEntity): boolean {
    return this.authorizationLevel(header) === 3;
  }

  private sumItems(items: { amount: number; unit_cost: number }[]): RequestTotals {
    return items.reduce<RequestTotals>(
      (totals, item) => ({
        concepts: totals.concepts + 1,
        units: totals.units + (Number(item.amount) || 0),
        amount: totals.amount + (Number(item.amount) || 0) * (Number(item.unit_cost) || 0),
      }),
      { concepts: 0, units: 0, amount: 0 }
    );
  }

  private async totalsByFolio(folios: string[]): Promise<Map<string, RequestTotals>> {
    const totals = new Map<string, RequestTotals>();
    if (folios.length === 0) return totals;

    const [detailRows, additionalRows] = await Promise.all([
      this.aggregateItems(database.getRepository(RequestDetailsEntity).createQueryBuilder('item'), folios),
      this.aggregateItems(database.getRepository(RequestsAdditionalEntity).createQueryBuilder('item'), folios),
    ]);

    for (const row of [...detailRows, ...additionalRows]) {
      const current = totals.get(row.folio) || { concepts: 0, units: 0, amount: 0 };

      totals.set(row.folio, {
        concepts: current.concepts + (Number(row.concepts) || 0),
        units: current.units + (Number(row.units) || 0),
        amount: current.amount + (Number(row.amount) || 0),
      });
    }

    return totals;
  }

  private async aggregateItems(
    builder: SelectQueryBuilder<RequestDetailsEntity | RequestsAdditionalEntity>,
    folios: string[]
  ): Promise<any[]> {
    return builder
      .select('item.folio_request', 'folio')
      .addSelect('COUNT(*)', 'concepts')
      .addSelect('SUM(item.amount)', 'units')
      .addSelect('SUM(item.amount * item.unit_cost)', 'amount')
      .where('item.folio_request IN (:...folios)', { folios })
      .andWhere('item.status = :active', { active: true })
      .groupBy('item.folio_request')
      .getRawMany();
  }

  private async itemsByFolio(folios: string[]): Promise<RequestDetailsEntity[]> {
    if (folios.length === 0) return [];

    const [details, additional] = await Promise.all([
      database.getRepository(RequestDetailsEntity).find({
        where: folios.map((folio) => ({ folio_request: folio, status: true })),
        order: { folio_request: 'ASC', id: 'ASC' },
      }),
      database.getRepository(RequestsAdditionalEntity).find({
        where: folios.map((folio) => ({ folio_request: folio, status: true })),
        order: { folio_request: 'ASC', id: 'ASC' },
      }),
    ]);

    return [...details, ...additional];
  }

  private async deleteFromDatabase(folioRequest: string): Promise<void> {
    await database.transaction(async (manager) => {
      await manager.delete(RequestDetailsEntity, { folio_request: folioRequest });
      await manager.delete(RequestHeadersEntity, { folio_request: folioRequest });
    });
  }

  private async createOnFirestore(
    header: RequestHeadersEntity,
    details: RequestDetailsEntity[]
  ): Promise<void> {
    const batch = firestore().batch();

    batch.set(firestore().collection(REQUESTS_COLLECTION).doc(header.id_header), toFirestoreHeader(header));

    const detailRef = firestore().collection(REQUESTS_COLLECTION).doc(`D${header.folio_request}`);
    batch.set(detailRef, { folioSol: header.folio_request }, { merge: true });

    details.forEach((detail, position) => {
      batch.set(detailRef.collection(ITEMS_SUBCOLLECTION).doc(itemDocumentId(position)), toFirestoreItem(detail));
    });

    await batch.commit();
  }

  private async updateHeaderOnFirestore(header: RequestHeadersEntity): Promise<void> {
    await firestore()
      .collection(REQUESTS_COLLECTION)
      .doc(header.id_header)
      .set(toFirestoreHeader(header), { merge: true });
  }
}
