import { RequestAdditional } from './request_additional';
import { RequestDetails } from './request_details';
import { RequestHeaders } from './request_headers';

export type RequestKind = 'M' | 'H';

export const REQUEST_STATUS_PENDING = 'Pendiente';
export const REQUEST_STATUS_SUPPLIED = 'Suministrada';

export interface ProjectSummary {
  project: string;
  total: number;
  pending: number;
  supplied: number;
  last_date: string | null;
}

export interface RequestTotals {
  concepts: number;
  units: number;
  amount: number;
}

export interface RequestSummary extends RequestTotals {
  id_header: string;
  folio_request: string;
  project: string;
  work: string;
  locality: string;
  requester: string;
  official: string;
  locationType: string;
  status_header: string;
  date: string;
}

export interface PagedRequests {
  data: RequestSummary[];
  total: number;
  page: number;
  limit: number;
}

export interface FullRequest {
  header: RequestHeaders;
  details: RequestDetails[];
  additional: RequestAdditional[];
  totals: RequestTotals;
}

export interface CreateRequestItem {
  name: string;
  amount: number;
  unit_cost: number;
  unit: string;
  code?: string;
  c1?: string;
  c2?: string;
  description?: string;
  observation?: string;
  category?: string;
  subcategory?: string;
}

export interface CreateRequestData {
  kind: RequestKind;
  header: Partial<RequestHeaders>;
  items: CreateRequestItem[];
}

export interface AuthorizationData {
  level: number;
  authorized: boolean;
  reviewer: string;
}
