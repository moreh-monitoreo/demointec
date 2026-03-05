import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { TrainingInstruction } from '../models/training-instruction';
import { TrainingInstructionFolder } from '../models/training-instruction-folder';

@Injectable({
  providedIn: 'root'
})
export class TrainingInstructionAdapterService {
  private myAppUrl: string;
  private myApiUrl = 'api/instrucciones-capacitacion/';
  private myFolderUrl = 'api/instrucciones-capacitacion-carpetas';
  private http = inject(HttpClient);

  constructor() {
    this.myAppUrl = environment.endpoint;
  }

  getDocuments(): Observable<TrainingInstruction[]> {
    return this.http.get<TrainingInstruction[]>(`${this.myAppUrl}${this.myApiUrl}`);
  }

  getDocumentsByType(documentType: string): Observable<TrainingInstruction[]> {
    return this.http.get<TrainingInstruction[]>(`${this.myAppUrl}${this.myApiUrl}tipo/${documentType}`);
  }

  saveDocument(docData: FormData): Observable<TrainingInstruction> {
    return this.http.post<TrainingInstruction>(`${this.myAppUrl}${this.myApiUrl}`, docData);
  }

  deleteDocument(id: number): Observable<void> {
    return this.http.delete<void>(`${this.myAppUrl}${this.myApiUrl}${id}`);
  }

  downloadDocument(url: string): Observable<Blob> {
    return this.http.post(`${this.myAppUrl}api/instrucciones-capacitacion-download`, { url }, { responseType: 'blob' });
  }

  getFolders(): Observable<TrainingInstructionFolder[]> {
    return this.http.get<TrainingInstructionFolder[]>(`${this.myAppUrl}${this.myFolderUrl}`);
  }

  createFolder(folderName: string): Observable<{ message: string; folder: TrainingInstructionFolder }> {
    return this.http.post<{ message: string; folder: TrainingInstructionFolder }>(
      `${this.myAppUrl}${this.myFolderUrl}`,
      { folder_name: folderName }
    );
  }

  deleteFolder(id: number): Observable<void> {
    return this.http.delete<void>(`${this.myAppUrl}${this.myFolderUrl}/${id}`);
  }
}
