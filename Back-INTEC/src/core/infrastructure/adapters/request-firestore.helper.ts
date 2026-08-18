import admin from 'firebase-admin';
import '../../../firebase/firebase.config';

export const REQUESTS_COLLECTION = 'SolicitudesCom';
export const CATALOGS_COLLECTION = 'Catalogos';
export const ITEMS_SUBCOLLECTION = 'items';
export const FOLIO_DOCUMENT = 'Folios';
export const ADDITIONAL_FOLIO_DOCUMENT = 'FoliosAdicionales';

export interface RequestItemFields {
  name: string;
  amount: number;
  code: string;
  c1: string;
  c2: string;
  unit_cost: number;
  description: string;
  observation: string;
  folio_request: string;
  category1: string;
  category: string;
  subcategory: string;
  unit: string;
}

export interface RequestHeaderFields {
  auth1: string;
  auth2: string;
  auth3: string;
  status_header: string;
  locationType: string;
  date?: Date | string;
  hour: string;
  revision_date1: string;
  revision_date2: string;
  revision_date3: string;
  folio_request: string;
  locality: string;
  notes: string;
  project: string;
  official: string;
  revision1: string;
  revision2: string;
  revision3: string;
  requester: string;
  work: string;
}

export const firestore = (): admin.firestore.Firestore => admin.firestore();

export const normalizeDate = (value?: Date | string | null): Date | undefined => {
  if (!value) return undefined;
  if (value instanceof Date) return isNaN(value.getTime()) ? undefined : value;

  const parts = String(value).trim().split(/[-/]/);
  if (parts.length !== 3) return undefined;

  const [first, second, third] = parts.map((part) => Number(part));
  if ([first, second, third].some((part) => isNaN(part))) return undefined;

  const isIsoOrder = parts[0].length === 4;
  const year = isIsoOrder ? first : third;
  const month = second;
  const day = isIsoOrder ? third : first;

  const date = new Date(year, month - 1, day);
  return isNaN(date.getTime()) ? undefined : date;
};

export const formatDate = (value?: Date | string | null): string => {
  const date = normalizeDate(value);
  if (!date) return '';

  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

export const toFirestoreItem = (item: RequestItemFields): Record<string, string> => ({
  nombre: String(item.name || ''),
  cantidad: String(item.amount ?? ''),
  codigo: String(item.code || ''),
  c1: String(item.c1 || ''),
  c2: String(item.c2 || ''),
  unidad: String(item.unit || ''),
  costoUnit: String(item.unit_cost ?? ''),
  descripcion: String(item.description || ''),
  observaciones: String(item.observation || ''),
  folioSol: String(item.folio_request || ''),
  categoria: String(item.category1 || ''),
  partida: String(item.category || ''),
  subpartida: String(item.subcategory || ''),
});

export const fromFirestoreItem = (data: admin.firestore.DocumentData): RequestItemFields => ({
  name: data.nombre || '',
  code: data.codigo || '',
  c1: data.c1 || '',
  c2: data.c2 || '',
  amount: Number(data.cantidad) || 0,
  unit_cost: Number(data.costoUnit) || 0,
  folio_request: data.folioSol || '',
  description: data.descripcion || '',
  observation: data.observaciones || '',
  category1: data.categoria || '',
  category: data.partida || '',
  subcategory: data.subpartida || '',
  unit: data.unidad || '',
});

export const toFirestoreHeader = (header: RequestHeaderFields): Record<string, string> => ({
  auth1: String(header.auth1 || ''),
  auth2: String(header.auth2 || ''),
  auth3: String(header.auth3 || ''),
  estatus: String(header.status_header || ''),
  fLocalForanea: String(header.locationType || ''),
  fecha: formatDate(header.date),
  hora: String(header.hour || ''),
  fechaRev1: String(header.revision_date1 || ''),
  fechaRev2: String(header.revision_date2 || ''),
  fechaRev3: String(header.revision_date3 || ''),
  folioSol: String(header.folio_request || ''),
  localidad: String(header.locality || ''),
  notas: String(header.notes || ''),
  obra: String(header.project || ''),
  oficial: String(header.official || ''),
  revisaA1: String(header.revision1 || ''),
  revisaA2: String(header.revision2 || ''),
  revisaA3: String(header.revision3 || ''),
  solicitante: String(header.requester || ''),
  trabajo: String(header.work || ''),
});

export const fromFirestoreHeader = (data: admin.firestore.DocumentData): RequestHeaderFields => ({
  auth1: data.auth1 || '',
  auth2: data.auth2 || '',
  auth3: data.auth3 || '',
  status_header: data.estatus || '',
  locationType: data.fLocalForanea || '',
  date: normalizeDate(data.fecha),
  hour: data.hora || '',
  revision_date1: data.fechaRev1 || '',
  revision_date2: data.fechaRev2 || '',
  revision_date3: data.fechaRev3 || '',
  folio_request: data.folioSol || '',
  locality: data.localidad || '',
  notes: data.notas || '',
  project: data.obra || '',
  official: data.oficial || '',
  revision1: data.revisaA1 || '',
  revision2: data.revisaA2 || '',
  revision3: data.revisaA3 || '',
  requester: data.solicitante || '',
  work: data.trabajo || '',
});

export const sortItemDocuments = (
  docs: admin.firestore.QueryDocumentSnapshot[]
): admin.firestore.QueryDocumentSnapshot[] => {
  const index = (id: string): number => Number(id.replace(/\D/g, '')) || 0;
  return [...docs].sort((a, b) => index(a.id) - index(b.id));
};

export const itemDocumentId = (position: number): string => `item${position + 1}`;

export const reserveFolio = async (documentId: string = FOLIO_DOCUMENT): Promise<number> => {
  const reference = firestore().collection(CATALOGS_COLLECTION).doc(documentId);

  return firestore().runTransaction(async (transaction) => {
    const snapshot = await transaction.get(reference);
    const data = snapshot.exists ? snapshot.data() || {} : {};
    const current = Number(data.Valor ?? data.SolicitudesCom ?? data.SolicitudesAdicionales) || 0;
    const next = current + 1;

    transaction.set(reference, { Valor: next }, { merge: true });
    return next;
  });
};

export const peekFolio = async (documentId: string = FOLIO_DOCUMENT): Promise<number> => {
  const snapshot = await firestore().collection(CATALOGS_COLLECTION).doc(documentId).get();
  const data = snapshot.exists ? snapshot.data() || {} : {};
  const current = Number(data.Valor ?? data.SolicitudesCom ?? data.SolicitudesAdicionales) || 0;
  return current + 1;
};

export const ensureRequestDocument = async (documentId: string): Promise<void> => {
  await firestore()
    .collection(REQUESTS_COLLECTION)
    .doc(documentId)
    .set({ _createdAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
};

export const deleteRequestDocument = async (documentId: string): Promise<void> => {
  const reference = firestore().collection(REQUESTS_COLLECTION).doc(documentId);
  const items = await reference.collection(ITEMS_SUBCOLLECTION).get();

  const batch = firestore().batch();
  items.docs.forEach((item) => batch.delete(item.ref));
  batch.delete(reference);

  await batch.commit();
};

export const deleteRequestItem = async (documentId: string, itemKey: string): Promise<void> => {
  await firestore()
    .collection(REQUESTS_COLLECTION)
    .doc(documentId)
    .collection(ITEMS_SUBCOLLECTION)
    .doc(itemKey)
    .delete();
};
