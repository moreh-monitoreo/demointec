import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { VacationAdjustment } from '../models/vacation-adjustment';

@Injectable({
    providedIn: 'root'
})
export class VacationAdjustmentAdapterService {
    private apiUrl = `${environment.endpoint}api/ajustes-vacaciones`;
    private http = inject(HttpClient);

    getList(): Observable<VacationAdjustment[]> {
        return this.http.get<VacationAdjustment[]>(this.apiUrl);
    }

    save(adjustment: VacationAdjustment): Observable<VacationAdjustment> {
        return this.http.post<VacationAdjustment>(this.apiUrl, adjustment);
    }
}
