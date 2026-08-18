import { RequestDetailsEntity } from "../../infrastructure/entity/request_details.entity";
import { RequestHeadersEntity } from "../../infrastructure/entity/request_headers.entity";
import { RequestsAdditionalEntity } from "../../infrastructure/entity/requests_additional.entity";

export const REQUEST_STATUS_PENDING = 'Pendiente';
export const REQUEST_STATUS_SUPPLIED = 'Suministrada';

export type RequestKind = 'M' | 'H';

export interface ProjectSummary {
  project: string;
  total: number;
  pending: number;
  supplied: number;
  last_date: Date | null;
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
  date: Date;
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
  header: Partial<RequestHeadersEntity>;
  items: CreateRequestItem[];
}

export interface AuthorizationData {
  level: number;
  authorized: boolean;
  reviewer: string;
}

export class PurchaseRequest {
  private header: RequestHeadersEntity | undefined;
  private details: RequestDetailsEntity[] = [];
  private additional: RequestsAdditionalEntity[] = [];
  private totals: RequestTotals | undefined;

  public get getHeader(): RequestHeadersEntity | undefined {
    return this.header;
  }
  public set setHeader(header: RequestHeadersEntity | undefined) {
    this.header = header;
  }

  public get getDetails(): RequestDetailsEntity[] {
    return this.details;
  }
  public set setDetails(details: RequestDetailsEntity[]) {
    this.details = details;
  }

  public get getAdditional(): RequestsAdditionalEntity[] {
    return this.additional;
  }
  public set setAdditional(additional: RequestsAdditionalEntity[]) {
    this.additional = additional;
  }

  public get getTotals(): RequestTotals | undefined {
    return this.totals;
  }
  public set setTotals(totals: RequestTotals | undefined) {
    this.totals = totals;
  }
}
