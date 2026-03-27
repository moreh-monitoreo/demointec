import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoanPayment } from '../models/loan_payment';

@Injectable({
  providedIn: 'root'
})
export class LoanPaymentAdapterService {
  private myAppUrl: string;
  private myApiUrl: string;
  private http = inject(HttpClient);

  constructor() {
    this.myAppUrl = environment.endpoint;
    this.myApiUrl = 'api/pagosPrestamo/';
  }

  getList(): Observable<LoanPayment[]> {
    return this.http.get<LoanPayment[]>(this.myAppUrl + this.myApiUrl);
  }

  get(id: string): Observable<LoanPayment> {
    return this.http.get<LoanPayment>(this.myAppUrl + this.myApiUrl + id);
  }

  getByLoan(id_loan: string): Observable<LoanPayment[]> {
    return this.http.get<LoanPayment[]>(this.myAppUrl + this.myApiUrl + 'prestamo/' + id_loan);
  }

  post(loanPayment: LoanPayment | LoanPayment[]): Observable<void> {
    return this.http.post<void>(this.myAppUrl + this.myApiUrl, loanPayment);
  }

  put(id: string, loanPayment: Partial<LoanPayment>): Observable<void> {
    return this.http.put<void>(this.myAppUrl + this.myApiUrl + id, loanPayment);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(this.myAppUrl + this.myApiUrl + id);
  }
}
