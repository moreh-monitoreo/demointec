import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { InventoryCategory } from '../models/inventory-category';

@Injectable({
  providedIn: 'root'
})
export class InventoryCategoryAdapterService {
  private myAppUrl: string;
  private myApiUrl: string;
  private http = inject(HttpClient);

  constructor() {
    this.myAppUrl = environment.endpoint;
    this.myApiUrl = 'api/categories-inventory/';
  }

  getList(): Observable<InventoryCategory[]> {
    return this.http.get<InventoryCategory[]>(this.myAppUrl + this.myApiUrl);
  }

  get(id: number): Observable<InventoryCategory> {
    return this.http.get<InventoryCategory>(this.myAppUrl + this.myApiUrl + id);
  }

  post(category: InventoryCategory): Observable<void> {
    return this.http.post<void>(this.myAppUrl + this.myApiUrl, category);
  }

  put(id: number, category: InventoryCategory): Observable<void> {
    return this.http.put<void>(this.myAppUrl + this.myApiUrl + id, category);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(this.myAppUrl + this.myApiUrl + id);
  }
}
