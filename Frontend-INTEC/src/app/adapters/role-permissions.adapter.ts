import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Module, Section, ModulePermission, RolePermissionPayload } from '../models/role-permissions';

@Injectable({
  providedIn: 'root'
})
export class RolePermissionsAdapterService {
  private myAppUrl: string;
  private http = inject(HttpClient);

  constructor() {
    this.myAppUrl = environment.endpoint;
  }

  getModules(): Observable<Module[]> {
    return this.http.get<Module[]>(this.myAppUrl + 'api/modules');
  }

  getSections(): Observable<Section[]> {
    return this.http.get<Section[]>(this.myAppUrl + 'api/sections');
  }

  getPermissionsByRole(roleId: number): Observable<ModulePermission[]> {
    return this.http.get<ModulePermission[]>(this.myAppUrl + `api/role-permissions/${roleId}`);
  }

  savePermissions(roleId: number, permissions: RolePermissionPayload[]): Observable<void> {
    return this.http.post<void>(this.myAppUrl + `api/role-permissions/${roleId}`, { permissions });
  }
}
