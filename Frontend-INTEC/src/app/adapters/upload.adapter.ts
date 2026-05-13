import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class UploadAdapterService {
    private apiUrl = `${environment.endpoint}api/uploads`;

    constructor(private http: HttpClient) { }

    uploadFile(file: File): Observable<{ path: string }> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post<{ path: string }>(this.apiUrl, formData);
    }

    uploadFiles(files: File[]): Observable<{ paths: string[] }> {
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));
        return this.http.post<{ paths: string[] }>(`${this.apiUrl}/multiple`, formData);
    }
}
