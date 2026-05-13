import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Termination {
    id?: number;
    id_employee: string;
    name_employee?: string; // Legacy
    employee?: { // Sync with backend relation
        name_employee: string;
        [key: string]: any;
    };
    last_work_day: string;
    reason: string;
    severance_date?: string;
    observation?: string;
    labor_event_id?: number;
    document_path?: string;
    document_name?: string;
    document_paths?: string[];
}

@Injectable({
    providedIn: 'root'
})
export class TerminationsAdapterService {
    private apiUrl = `${environment.endpoint}api/terminations`;

    constructor(private http: HttpClient) { }

    getTerminations(): Observable<Termination[]> {
        return this.http.get<Termination[]>(this.apiUrl);
    }

    getTermination(id: number): Observable<Termination> {
        return this.http.get<Termination>(`${this.apiUrl}/${id}`);
    }

    createTermination(termination: Termination): Observable<Termination> {
        return this.http.post<Termination>(this.apiUrl, termination);
    }

    updateTermination(id: number, termination: Termination): Observable<Termination> {
        return this.http.put<Termination>(`${this.apiUrl}/${id}`, termination);
    }

    deleteTermination(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
