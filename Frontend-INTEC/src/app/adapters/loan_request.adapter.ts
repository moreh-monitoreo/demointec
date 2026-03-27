import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoanRequest } from '../models/loan_request';

@Injectable({
  providedIn: 'root'
})
export class LoanRequestAdapterService {
  private myAppUrl: string;
  private myApiUrl: string;
  private http = inject(HttpClient);

  constructor() {
    this.myAppUrl = environment.endpoint;
    this.myApiUrl = 'api/prestamos/';
  }

  getList(): Observable<LoanRequest[]> {
    return this.http.get<LoanRequest[]>(this.myAppUrl + this.myApiUrl);
  }

  get(id: string): Observable<LoanRequest> {
    return this.http.get<LoanRequest>(this.myAppUrl + this.myApiUrl + id);
  }

  post(loanRequest: LoanRequest): Observable<void> {
    return this.http.post<void>(this.myAppUrl + this.myApiUrl, loanRequest);
  }

  put(id: string, loanRequest: Partial<LoanRequest>): Observable<void> {
    return this.http.put<void>(this.myAppUrl + this.myApiUrl + id, loanRequest);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(this.myAppUrl + this.myApiUrl + id);
  }
}
