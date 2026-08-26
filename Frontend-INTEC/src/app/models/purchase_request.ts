import { RequestAdditional } from './request_additional';
import { RequestDetails } from './request_details';
import { RequestHeaders } from './request_headers';

export type RequestKind = 'M' | 'H';

export const SUPPLY_STATUS_PENDING = 'Pendiente';
export const SUPPLY_STATUS_PARTIAL = 'Surtida Parcial';
export const SUPPLY_STATUS_DELIVERED = 'Surtida';
export const SUPPLY_DELIVERED_VALUES = [SUPPLY_STATUS_DELIVERED, 'Suministrada'];

export interface ProjectSummary {
  project: string;
  total: number;
  pending: number;
  partial: number;
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
  supply_status: string;
  request_type: string;
  authorized: boolean;
  authorization_level: number;
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

export type ItemSource = 'detail' | 'additional';

export interface ItemSelection {
  source: ItemSource;
  id: number;
}
