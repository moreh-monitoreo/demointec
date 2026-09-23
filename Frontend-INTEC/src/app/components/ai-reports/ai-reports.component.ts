import { Component, OnInit, AfterViewChecked, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AiReportsAdapterService } from '../../adapters/ai-reports.adapter';
import { AiConversation, AiChartSpec } from '../../models/ai-report';
import { AiChartComponent } from './ai-chart/ai-chart.component';
import { MarkdownLitePipe } from '../../pipes/markdown-lite.pipe';

interface UiMessage {
  role: 'user' | 'assistant';
  content: string;
  chart: AiChartSpec | null;
  pending?: boolean;
}

const SUGGESTED_QUESTIONS = [
  '¿Cuántos empleados activos tenemos por puesto?',
  '¿Cuál ha sido la tasa de rotación de personal?',
  '¿Cuántas incapacidades se han registrado, por tipo?',
  '¿Cuál es el costo de salario base por puesto?',
];

@Component({
  selector: 'app-ai-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, AiChartComponent, MarkdownLitePipe],
  templateUrl: './ai-reports.component.html',
  styleUrl: './ai-reports.component.css',
})
export class AiReportsComponent implements OnInit, AfterViewChecked {
  private adapter = inject(AiReportsAdapterService);
  private toastr = inject(ToastrService);

  @ViewChild('scrollArea') scrollArea?: ElementRef<HTMLDivElement>;
  private shouldScroll = false;

  conversations: AiConversation[] = [];
  currentConversationId: number | null = null;
  messages: UiMessage[] = [];
  draft = '';
  isSending = false;
  isLoadingConversations = false;
  suggestions = SUGGESTED_QUESTIONS;

  ngOnInit(): void {
    this.loadConversations();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  loadConversations(): void {
    this.isLoadingConversations = true;
    this.adapter.getConversations().subscribe({
      next: (data) => {
        this.conversations = data;
        this.isLoadingConversations = false;
      },
      error: () => { this.isLoadingConversations = false; },
    });
  }

  newConversation(): void {
    this.currentConversationId = null;
    this.messages = [];
    this.draft = '';
  }

  selectConversation(conv: AiConversation): void {
    if (this.currentConversationId === conv.id) return;
    this.currentConversationId = conv.id;
    this.messages = [];
    this.adapter.getMessages(conv.id).subscribe({
      next: (data) => {
        this.messages = data.map((m) => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content,
          chart: m.chart_json ? JSON.parse(m.chart_json) : null,
        }));
        this.shouldScroll = true;
      },
      error: () => { this.toastr.error('No se pudo cargar la conversación'); },
    });
  }

  askSuggestion(text: string): void {
    this.draft = text;
    this.send();
  }

  send(): void {
    const text = this.draft.trim();
    if (!text || this.isSending) return;

    this.messages.push({ role: 'user', content: text, chart: null });
    this.messages.push({ role: 'assistant', content: '', chart: null, pending: true });
    this.draft = '';
    this.isSending = true;
    this.shouldScroll = true;

    const wasNewConversation = this.currentConversationId === null;

    this.adapter.sendMessage(text, this.currentConversationId).subscribe({
      next: (res) => {
        this.currentConversationId = res.id_conversation;
        const pendingIndex = this.messages.findIndex((m) => m.pending);
        if (pendingIndex !== -1) {
          this.messages[pendingIndex] = { role: 'assistant', content: res.message.content, chart: res.message.chart };
        }
        this.isSending = false;
        this.shouldScroll = true;

        if (wasNewConversation) {
          this.loadConversations();
        } else {
          const conv = this.conversations.find((c) => c.id === this.currentConversationId);
          if (conv) {
            this.conversations = [conv, ...this.conversations.filter((c) => c.id !== conv.id)];
          }
        }
      },
      error: () => {
        const pendingIndex = this.messages.findIndex((m) => m.pending);
        if (pendingIndex !== -1) {
          this.messages[pendingIndex] = {
            role: 'assistant',
            content: 'Ocurrió un error al procesar tu pregunta. Intenta de nuevo en unos segundos.',
            chart: null,
          };
        }
        this.isSending = false;
        this.toastr.error('No se pudo obtener respuesta del asistente');
      },
    });
  }

  deleteConversation(conv: AiConversation, event: Event): void {
    event.stopPropagation();
    if (!confirm(`¿Eliminar la conversación "${conv.title}"?`)) return;
    this.adapter.deleteConversation(conv.id).subscribe({
      next: () => {
        this.conversations = this.conversations.filter((c) => c.id !== conv.id);
        if (this.currentConversationId === conv.id) this.newConversation();
      },
      error: () => this.toastr.error('No se pudo eliminar la conversación'),
    });
  }

  private scrollToBottom(): void {
    try {
      if (this.scrollArea) {
        this.scrollArea.nativeElement.scrollTop = this.scrollArea.nativeElement.scrollHeight;
      }
    } catch { }
  }
}
