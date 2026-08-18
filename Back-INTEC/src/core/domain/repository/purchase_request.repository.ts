import { RequestDetailsEntity } from "../../infrastructure/entity/request_details.entity";
import { RequestHeadersEntity } from "../../infrastructure/entity/request_headers.entity";
import { RequestsAdditionalEntity } from "../../infrastructure/entity/requests_additional.entity";
import {
  AuthorizationData,
  CreateRequestData,
  ProjectSummary,
  RequestSummary,
  RequestTotals,
} from "../models/purchase_request";

export type Query = Record<string, any>;

export interface PagedRequests {
  data: RequestSummary[];
  total: number;
  page: number;
  limit: number;
}

export interface FullRequest {
  header: RequestHeadersEntity;
  details: RequestDetailsEntity[];
  additional: RequestsAdditionalEntity[];
  totals: RequestTotals;
}

export interface PurchaseRequestRepository {
  listProjects(query?: Query): Promise<ProjectSummary[]>;
  listByProject(project: string, query?: Query): Promise<PagedRequests>;
  get(folio: string): Promise<FullRequest>;
  create(data: CreateRequestData): Promise<FullRequest>;
  remove(folio: string): Promise<RequestHeadersEntity>;
  updateStatus(folio: string, status: string): Promise<RequestHeadersEntity>;
  updateAuthorization(folio: string, data: AuthorizationData): Promise<RequestHeadersEntity>;
  exportToBuffer(query?: Query): Promise<Buffer>;
}
