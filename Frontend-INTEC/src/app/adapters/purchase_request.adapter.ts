import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { RequestHeaders } from '../models/request_headers';
import {
  AuthorizationData,
  CreateRequestData,
  FullRequest,
  PagedRequests,
  ProjectSummary,
} from '../models/purchase_request';

@Injectable({
  providedIn: 'root'
})
export class PurchaseRequestAdapterService {
  private myAppUrl: string;
  private myApiUrl: string;
  private http = inject(HttpClient);

  constructor() {
    this.myAppUrl = environment.endpoint;
    this.myApiUrl = 'api/solicitudes';
  }

  getProjects(filters: Record<string, string> = {}): Observable<ProjectSummary[]> {
    return this.http.get<ProjectSummary[]>(`${this.myAppUrl}${this.myApiUrl}/por-obra`, {
      headers: this.authHeaders(),
      params: this.toParams(filters)
    });
  }

  getByProject(project: string, filters: Record<string, string> = {}): Observable<PagedRequests> {
    return this.http.get<PagedRequests>(
      `${this.myAppUrl}${this.myApiUrl}/por-obra/${encodeURIComponent(project)}`,
      { headers: this.authHeaders(), params: this.toParams(filters) }
    );
  }

  get(folio: string): Observable<FullRequest> {
    return this.http.get<FullRequest>(`${this.myAppUrl}${this.myApiUrl}/${folio}`, {
      headers: this.authHeaders()
    });
  }

  post(request: CreateRequestData): Observable<FullRequest> {
    return this.http.post<FullRequest>(`${this.myAppUrl}${this.myApiUrl}`, request, {
      headers: this.authHeaders()
    });
  }

  updateStatus(folio: string, statusHeader: string): Observable<RequestHeaders> {
    return this.http.patch<RequestHeaders>(
      `${this.myAppUrl}${this.myApiUrl}/${folio}/estatus`,
      { status_header: statusHeader },
      { headers: this.authHeaders() }
    );
  }

  updateAuthorization(folio: string, data: AuthorizationData): Observable<RequestHeaders> {
    return this.http.patch<RequestHeaders>(
      `${this.myAppUrl}${this.myApiUrl}/${folio}/autorizacion`,
      data,
      { headers: this.authHeaders() }
    );
  }

  delete(folio: string): Observable<void> {
    return this.http.delete<void>(`${this.myAppUrl}${this.myApiUrl}/${folio}`, {
      headers: this.authHeaders()
    });
  }

  export(filters: Record<string, string> = {}): Observable<Blob> {
    return this.http.get(`${this.myAppUrl}${this.myApiUrl}/exportar`, {
      headers: this.authHeaders(),
      params: this.toParams(filters),
      responseType: 'blob'
    });
  }

  private authHeaders(): HttpHeaders {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
    return new HttpHeaders({ Authorization: `Bearer ${token || ''}` });
  }

  private toParams(filters: Record<string, string>): HttpParams {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, value);
      }
    });
    return params;
  }
}
