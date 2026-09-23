import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AiConversation, AiMessage, AiChatResponse } from '../models/ai-report';

@Injectable({
    providedIn: 'root'
})
export class AiReportsAdapterService {
    private apiUrl = `${environment.endpoint}api/reportes-ia`;
    private http = inject(HttpClient);

    private authHeaders(): HttpHeaders {
        const token = localStorage.getItem('token') || '';
        return new HttpHeaders({ Authorization: `Bearer ${token}` });
    }

    getConversations(): Observable<AiConversation[]> {
        return this.http.get<AiConversation[]>(`${this.apiUrl}/conversaciones`, { headers: this.authHeaders() });
    }

    getMessages(idConversation: number): Observable<AiMessage[]> {
        return this.http.get<AiMessage[]>(`${this.apiUrl}/conversaciones/${idConversation}/mensajes`, { headers: this.authHeaders() });
    }

    sendMessage(pregunta: string, idConversation?: number | null): Observable<AiChatResponse> {
        return this.http.post<AiChatResponse>(
            `${this.apiUrl}/mensajes`,
            { pregunta, id_conversation: idConversation ?? null },
            { headers: this.authHeaders() }
        );
    }

    deleteConversation(idConversation: number): Observable<{ message: string }> {
        return this.http.delete<{ message: string }>(`${this.apiUrl}/conversaciones/${idConversation}`, { headers: this.authHeaders() });
    }
}
