import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AbsenceAttachment } from '../models/absence-attachment';

@Injectable({
    providedIn: 'root'
})
export class AbsenceAttachmentAdapterService {
    private apiUrl = `${environment.endpoint}api/adjuntos`;
    private http = inject(HttpClient);

    // Sube uno o varios archivos vinculados a un registro específico
    upload(idEmployee: string, referenceType: string, referenceId: string, files: File[]): Observable<any> {
        const formData = new FormData();
        formData.append('id_employee', idEmployee);
        formData.append('reference_type', referenceType);
        formData.append('reference_id', referenceId);
        files.forEach(file => formData.append('files', file));
        return this.http.post(this.apiUrl, formData);
    }

    getByReference(referenceId: string): Observable<AbsenceAttachment[]> {
        return this.http.get<AbsenceAttachment[]>(`${this.apiUrl}/${referenceId}`);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
