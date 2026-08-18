import { Query, Id } from "../../domain/repository/requests_additional.repository";
import database from "../../../config/db";
import { NotFound } from "http-errors";
import { RequestsAdditionalEntity } from "../entity/requests_additional.entity";
import { RequestsAdditionalRepository } from "../../domain/repository/requests_additional.repository";
import {
  ADDITIONAL_FOLIO_DOCUMENT,
  ITEMS_SUBCOLLECTION,
  REQUESTS_COLLECTION,
  deleteRequestDocument,
  ensureRequestDocument,
  firestore,
  fromFirestoreItem,
  itemDocumentId,
  peekFolio,
  reserveFolio,
  sortItemDocuments,
  toFirestoreItem,
} from "./request-firestore.helper";



export class RequestsAdditionalAdapterRepository implements RequestsAdditionalRepository<RequestsAdditionalEntity> {

  async create(data: Partial<RequestsAdditionalEntity>[] | Partial<RequestsAdditionalEntity>): Promise<RequestsAdditionalEntity[] | RequestsAdditionalEntity> {
    const repository = database.getRepository(RequestsAdditionalEntity);

    const materiales: RequestsAdditionalEntity[] = [];

    const dataArray = Array.isArray(data) ? data : [data];

    for (const item of dataArray) {
      const entity = repository.create(item);
      await repository.save(entity);
      materiales.push(entity);
    }

    await reserveFolio(ADDITIONAL_FOLIO_DOCUMENT);

    await this.createOnFirestore(materiales);

    return Array.isArray(data) ? materiales : materiales[0];
  }


  async list(query?: Query): Promise<RequestsAdditionalEntity[]> {
    const repository = database.getRepository(RequestsAdditionalEntity);
    return repository.find({
    });
  }

  async get(id: Id, query?: Query): Promise<RequestsAdditionalEntity[]> {
    const repository = database.getRepository(RequestsAdditionalEntity);
    const data = await repository.find({
      where: { id_detail: id as string },
      order: { id: 'ASC' },
    });
    if (!data.length) {
      throw new NotFound("No existen materiales adicionales con el id_detail proporcionado");
    }
    return data;
  }


  async update(data: Partial<RequestsAdditionalEntity>[], query?: Query): Promise<RequestsAdditionalEntity[]> {
    const repository = database.getRepository(RequestsAdditionalEntity);
    const updatedMaterials: RequestsAdditionalEntity[] = [];
    const toCreate: RequestsAdditionalEntity[] = [];
    const toUpdate: RequestsAdditionalEntity[] = [];

    try {
      for (const item of data) {
        if (!item.id_detail) {
          throw new Error('Cada material adicional debe tener su id_detail para poder actualizar');
        }

        if (!item.id) {
          throw new Error('Cada material adicional debe tener su id para poder actualizar');
        }

        const existingRecord = await repository.findOne({
          where: { id: item.id }
        });

        if (!existingRecord) {
          throw new Error(`No se encontró el detalle adicional con id: ${item.id}`);
        }

        const updatedEntity = repository.create(item);
        await repository.save(updatedEntity);

        const updatedRecord = await repository.findOne({ where: { id: item.id } });
        if (updatedRecord) {
          updatedMaterials.push(updatedRecord);
        }

        const existsInRTDB = await this.existsInFirestore(item.id_detail);

        if (existsInRTDB) {
          if (updatedRecord) toUpdate.push(updatedRecord);
        } else {
          if (updatedRecord) toCreate.push(updatedRecord);
        }
      }

      if (toCreate.length > 0) {
        await this.createOnFirestore(toCreate);
      }

      if (toUpdate.length > 0) {
        await this.updateOnFirestore(toUpdate);
      }

      return updatedMaterials;
    } catch (error) {
      console.error('Error en update del adapter de adicionales:', error);
      throw error;
    }
  }



  async remove(id: Id, query?: Query): Promise<RequestsAdditionalEntity[]> {
  const repository = database.getRepository(RequestsAdditionalEntity);
  const data = await this.get(id, query);

  if (!data.length) {
    throw new Error("No se encontraron detalles adicionales con el ID proporcionado");
  }

  await repository.update({ id_detail: id.toString() }, { status: false });
  await deleteRequestDocument(id.toString());

  return data;
}

  async getCurrentFolio(): Promise<number> {
    try {
      return await peekFolio(ADDITIONAL_FOLIO_DOCUMENT);
    } catch (error) {
      console.error('Error al obtener el folio adicional actual:', error);
      throw new Error('No se pudo obtener el folio adicional actual');
    }
  }


  async syncToFirebase(): Promise<{ success: boolean }> {
    const repository = database.getRepository(RequestsAdditionalEntity);

    try {
      const [seccionesSnapshot, itemsGroupSnapshot] = await Promise.all([
        firestore().collection(REQUESTS_COLLECTION).get(),
        firestore().collectionGroup(ITEMS_SUBCOLLECTION).get()
      ]);

      const seccionIds = new Set<string>();
      for (const doc of seccionesSnapshot.docs) {
        if (doc.id) seccionIds.add(doc.id);
      }
      for (const itemDoc of itemsGroupSnapshot.docs) {
        const parent = itemDoc.ref.parent.parent;
        if (parent?.id) seccionIds.add(parent.id);
      }

      const idsToProcess = Array.from(seccionIds).filter((id) => id.startsWith('A'));
      if (idsToProcess.length === 0) {
        return { success: false };
      }

      for (const seccionId of idsToProcess) {
        try {
          const itemsSnapshot = await firestore()
            .collection(REQUESTS_COLLECTION)
            .doc(seccionId)
            .collection(ITEMS_SUBCOLLECTION)
            .get();

          const itemDocs = sortItemDocuments(itemsSnapshot.docs);
          const existingRows = await repository.find({
            where: { id_detail: seccionId },
            order: { id: 'ASC' },
          });

          for (let position = 0; position < itemDocs.length; position++) {
            const item = itemDocs[position].data();
            if (!item) continue;

            const newData = fromFirestoreItem(item);
            const existing = existingRows[position];

            if (!existing) {
              const entity = repository.create({
                id_detail: seccionId,
                ...newData,
                status: true,
              });

              await repository.save(entity);
              continue;
            }

            const hasChanges =
              existing.name !== newData.name ||
              existing.code !== newData.code ||
              existing.amount !== newData.amount ||
              existing.c1 !== newData.c1 ||
              existing.c2 !== newData.c2 ||
              existing.unit !== newData.unit ||
              existing.unit_cost !== newData.unit_cost ||
              existing.description !== newData.description ||
              existing.observation !== newData.observation ||
              existing.category1 !== newData.category1 ||
              existing.category !== newData.category ||
              existing.subcategory !== newData.subcategory ||
              existing.folio_request !== newData.folio_request;

            if (hasChanges) {
              Object.assign(existing, newData);
              await repository.save(existing);
            }
          }
        } catch (error) {
          console.error(`Error procesando sección adicional ${seccionId}:`, error);
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error en sincronización de materiales adicionales (Firestore):', error);
      throw error;
    }
  }

  private async createOnFirestore(materiales: RequestsAdditionalEntity[]): Promise<void> {
    if (materiales.length === 0) return;

    const groupByIdDetail: Record<string, RequestsAdditionalEntity[]> = {};

    for (const material of materiales) {
      if (!material.id_detail) {
        throw new Error('id_detail es requerido en cada material adicional');
      }
      if (!groupByIdDetail[material.id_detail]) {
        groupByIdDetail[material.id_detail] = [];
      }
      groupByIdDetail[material.id_detail].push(material);
    }

    for (const [idDetail, items] of Object.entries(groupByIdDetail)) {
      await ensureRequestDocument(idDetail);

      const itemsRef = firestore()
        .collection(REQUESTS_COLLECTION)
        .doc(idDetail)
        .collection(ITEMS_SUBCOLLECTION);
      const existing = await itemsRef.get();

      let position = existing.size;

      for (const material of items) {
        await itemsRef.doc(itemDocumentId(position)).set(toFirestoreItem(material));
        position++;
      }
    }
  }

  private async updateOnFirestore(materiales: RequestsAdditionalEntity[]): Promise<void> {
    if (!materiales.length) return;

    const repository = database.getRepository(RequestsAdditionalEntity);
    const groupBySeccion: Record<string, RequestsAdditionalEntity[]> = {};

    for (const mat of materiales) {
      if (!mat.id_detail) {
        throw new Error('id_detail es requerido para actualizar en Firebase adicionales');
      }

      if (!groupBySeccion[mat.id_detail]) {
        groupBySeccion[mat.id_detail] = [];
      }

      groupBySeccion[mat.id_detail].push(mat);
    }

    for (const [seccion, mats] of Object.entries(groupBySeccion)) {
      await ensureRequestDocument(seccion);

      const itemsRef = firestore()
        .collection(REQUESTS_COLLECTION)
        .doc(seccion)
        .collection(ITEMS_SUBCOLLECTION);

      const orderedRows = await repository.find({
        where: { id_detail: seccion },
        order: { id: 'ASC' },
      });

      for (const mat of mats) {
        const position = orderedRows.findIndex((row) => row.id === mat.id);
        const targetPosition = position >= 0 ? position : orderedRows.length;

        await itemsRef.doc(itemDocumentId(targetPosition)).set(toFirestoreItem(mat));
      }
    }
  }


  private async existsInFirestore(id: string): Promise<boolean> {
    try {
      const doc = await firestore().collection(REQUESTS_COLLECTION).doc(id).get();
      return doc.exists;
    } catch (error) {
      console.error('Error al verificar existencia adicional en Firestore:', error);
      return false;
    }
  }

}
