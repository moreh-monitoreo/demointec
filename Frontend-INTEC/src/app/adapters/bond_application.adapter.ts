import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { BondApplication } from '../models/bond_application';

@Injectable({
  providedIn: 'root'
})
export class BondApplicationAdapterService {
  private myAppUrl: string;
  private myApiUrl: string;
  private http = inject(HttpClient);

  constructor() {
    this.myAppUrl = environment.endpoint;
    this.myApiUrl = 'api/bonoPermanencia/';
  }

  getList(): Observable<BondApplication[]> {
    return this.http.get<BondApplication[]>(this.myAppUrl + this.myApiUrl);
  }

  get(id: string): Observable<BondApplication> {
    return this.http.get<BondApplication>(this.myAppUrl + this.myApiUrl + id);
  }

  post(bond: BondApplication): Observable<void> {
    return this.http.post<void>(this.myAppUrl + this.myApiUrl, bond);
  }

  put(id: string, bond: Partial<BondApplication>): Observable<void> {
    return this.http.put<void>(this.myAppUrl + this.myApiUrl + id, bond);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(this.myAppUrl + this.myApiUrl + id);
  }
}
