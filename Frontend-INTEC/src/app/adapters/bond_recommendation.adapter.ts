import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { BondRecommendation } from '../models/bond_recommendation';

@Injectable({
  providedIn: 'root'
})
export class BondRecommendationAdapterService {
  private myAppUrl: string;
  private myApiUrl: string;
  private http = inject(HttpClient);

  constructor() {
    this.myAppUrl = environment.endpoint;
    this.myApiUrl = 'api/bonoRecomendacion/';
  }

  getList(): Observable<BondRecommendation[]> {
    return this.http.get<BondRecommendation[]>(this.myAppUrl + this.myApiUrl);
  }

  get(id: string): Observable<BondRecommendation> {
    return this.http.get<BondRecommendation>(this.myAppUrl + this.myApiUrl + id);
  }

  post(bond: BondRecommendation): Observable<void> {
    return this.http.post<void>(this.myAppUrl + this.myApiUrl, bond);
  }

  put(id: string, bond: Partial<BondRecommendation>): Observable<void> {
    return this.http.put<void>(this.myAppUrl + this.myApiUrl + id, bond);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(this.myAppUrl + this.myApiUrl + id);
  }
}
