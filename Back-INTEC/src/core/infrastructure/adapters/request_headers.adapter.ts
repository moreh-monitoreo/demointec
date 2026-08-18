import { Query, Id } from "../../domain/repository/users.repository";
import database from "../../../config/db";
import { NotFound } from "http-errors";
import { RequestHeadersRepository } from "../../domain/repository/request_headers.repository";
import { RequestHeadersEntity } from "../entity/request_headers.entity";
import {
  REQUESTS_COLLECTION,
  deleteRequestDocument,
  firestore,
  formatDate,
  fromFirestoreHeader,
  toFirestoreHeader,
} from "./request-firestore.helper";



export class RequestHeadersAdpaterRepository implements RequestHeadersRepository<RequestHeadersEntity> {

  async create(data: Partial<RequestHeadersEntity>[] | Partial<RequestHeadersEntity>): Promise<RequestHeadersEntity[] | RequestHeadersEntity> {
    const repository = database.getRepository(RequestHeadersEntity);
    const materiales: RequestHeadersEntity[] = [];

    const dataArray = Array.isArray(data) ? data : [data];

    for (const item of dataArray) {
      const entity = repository.create(item);
      await repository.save(entity);
      materiales.push(entity);
    }

    await this.createOnFirestore(materiales);
    return Array.isArray(data) ? materiales : materiales[0];
  }


  async list(query?: Query): Promise<RequestHeadersEntity[]> {
    const repository = database.getRepository(RequestHeadersEntity);
    return repository.find({
    });
  }

  async get(id: Id, query?: Query): Promise<RequestHeadersEntity> {
    const repository = database.getRepository(RequestHeadersEntity);
    const data = await repository.findOne({
      where: { id_header: id as string },
    });
    if (!data) {
      throw new NotFound("No existe la solicitud con el id proporcionado");
    }
    return data;
  }

  async update(data: Partial<RequestHeadersEntity>[], query?: Query): Promise<RequestHeadersEntity[]> {
      const repository = database.getRepository(RequestHeadersEntity);
      const updatedH: RequestHeadersEntity[] = [];
      const toCreate: RequestHeadersEntity[] = [];
      const toUpdate: RequestHeadersEntity[] = [];

      for (const item of data) {
        if (!item.id_header) {
          throw new Error('Cada solicitud debe tener su id_header para poder actualizar');
        }
        await repository.update({ id_header: item.id_header }, item);
        const updated = await this.get(item.id_header);
        updatedH.push(updated);


        const existsInRTDB = await this.existsInFirestore(item.id_header);

        if (existsInRTDB) {
          toUpdate.push(updated);
        } else {
          toCreate.push(updated);
        }
      }

      if (toCreate.length > 0) {
        await this.createOnFirestore(toCreate);
      }
      if (toUpdate.length > 0) {
        await this.updateOnFirestore(toUpdate);
      }

      return updatedH;
    }

  async remove(id: Id, query?: Query): Promise<RequestHeadersEntity> {
    const repository = database.getRepository(RequestHeadersEntity);
    const data = await this.get(id, query);
    await repository.update({ id_header: id.toString()  }, { status: false });
    await deleteRequestDocument(id.toString());
    return data;
  }

  async syncToFirebase(): Promise<{ success: boolean }> {
    const repository = database.getRepository(RequestHeadersEntity);

    try {
        const seccionesSnapshot = await firestore().collection(REQUESTS_COLLECTION).get();

        if (seccionesSnapshot.empty) {
          return { success: false };
        }

        const operaciones: Promise<void>[] = [];

        for (const doc of seccionesSnapshot.docs) {
          const seccionKey = doc.id;
          if (!seccionKey.startsWith('E')) continue;

          const item = doc.data();
          if (!item) continue;

          const newData = fromFirestoreHeader(item);

          operaciones.push(
              (async () => {
              try {
                  const existing = await repository.findOne({ where: { id_header: seccionKey } });

                  if (!existing) {
                  const entity = repository.create({
                      id_header: seccionKey,
                      ...newData,
                      date: newData.date as Date,
                      status: true
                  });

                  await repository.save(entity);
                  } else {
                  const hasChanges =
                      existing.auth1 !== newData.auth1 ||
                      existing.auth2 !== newData.auth2 ||
                      existing.auth3 !== newData.auth3 ||
                      existing.status_header !== newData.status_header ||
                      existing.locationType !== newData.locationType ||
                      formatDate(existing.date) !== formatDate(newData.date) ||
                      existing.hour !== newData.hour ||
                      existing.revision_date1 !== newData.revision_date1 ||
                      existing.revision_date2 !== newData.revision_date2 ||
                      existing.revision_date3 !== newData.revision_date3 ||
                      existing.folio_request !== newData.folio_request ||
                      existing.locality !== newData.locality ||
                      existing.notes !== newData.notes ||
                      existing.project !== newData.project ||
                      existing.official !== newData.official ||
                      existing.revision1 !== newData.revision1 ||
                      existing.revision2 !== newData.revision2 ||
                      existing.revision3 !== newData.revision3 ||
                      existing.requester !== newData.requester ||
                      existing.work !== newData.work;

                  if (hasChanges) {
                      Object.assign(existing, newData);
                      await repository.save(existing);
                  }
                  }
              } catch (error) {
                  console.error(`Error procesando encabezado ${seccionKey}:`, error);
              }
              })()
          );
        }

        await Promise.all(operaciones);
        return { success: true };
    } catch (error) {
        console.error('Error en sincronización de encabezados (Firestore):', error);
        throw error;
    }
  }

  private async createOnFirestore(encabezados: RequestHeadersEntity[]): Promise<void> {
    if (encabezados.length === 0) return;

    for (const encabezado of encabezados) {
        if (!encabezado.id_header) {
        throw new Error('id_header es requerido en cada encabezado');
        }

        await firestore()
          .collection(REQUESTS_COLLECTION)
          .doc(encabezado.id_header)
          .set(toFirestoreHeader(encabezado));
    }
  }

  private async updateOnFirestore(encabezados: RequestHeadersEntity[]): Promise<void> {
    if (!encabezados.length) return;

    for (const encabezado of encabezados) {
        const docRef = firestore().collection(REQUESTS_COLLECTION).doc(encabezado.id_header);
        const exists = await docRef.get();
        if (!exists.exists) {
          throw new Error(`La sección ${encabezado.id_header} no existe en Firestore`);
        }

        await docRef.set(toFirestoreHeader(encabezado));
    }
  }


  private async existsInFirestore(id: string): Promise<boolean> {
    try {
      const doc = await firestore().collection(REQUESTS_COLLECTION).doc(id).get();
      return doc.exists;
    } catch (error) {
      console.error('Error al verificar existencia en Firestore:', error);
      return false;
    }
  }

}
