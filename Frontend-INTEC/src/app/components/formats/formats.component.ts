import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface FormatItem {
  key: string;
  label: string;
  description: string;
  icon: string;
  filePath: string;
  fileName: string;
}

@Component({
  selector: 'app-formats',
  templateUrl: './formats.component.html',
  styleUrl: './formats.component.css',
  imports: [CommonModule]
})
export class FormatsComponent {

  formats: FormatItem[] = [
    {
      key: 'entrevista-salida',
      label: 'Entrevista de Salida',
      description: 'Formulario de entrevista de salida del colaborador',
      icon: 'bi-file-earmark-pdf',
      filePath: '/formatos/ENTREVISTA DE SALIDA.pdf',
      fileName: 'Entrevista de Salida.pdf'
    },
    {
      key: 'encuesta-satisfaccion',
      label: 'Encuesta de Satisfacción Laboral',
      description: 'Encuesta de satisfacción laboral del colaborador',
      icon: 'bi-file-earmark-pdf',
      filePath: '/formatos/Encuesta de satisfacción laboral.pdf',
      fileName: 'Encuesta de Satisfacción Laboral.pdf'
    },
    {
      key: 'aviso-privacidad',
      label: 'Aviso de Privacidad',
      description: 'Aviso de privacidad para el colaborador',
      icon: 'bi-file-earmark-pdf',
      filePath: '/formatos/AVISO DE PRIVACIDAD.pdf',
      fileName: 'Aviso de Privacidad.pdf'
    },
    {
      key: 'caratula-ingreso',
      label: 'Carátula de Ingreso',
      description: 'Carátula de ingreso del colaborador',
      icon: 'bi-file-earmark-pdf',
      filePath: '/formatos/CARATULA DE INGRESO.pdf',
      fileName: 'Carátula de Ingreso.pdf'
    },
    {
      key: 'carta-patronal',
      label: 'Carta Patronal',
      description: 'Carta patronal del colaborador',
      icon: 'bi-file-earmark-pdf',
      filePath: '/formatos/CARTA PATRONAL.pdf',
      fileName: 'Carta Patronal.pdf'
    },
    {
      key: 'constancia-abandono',
      label: 'Constancia de Abandono de Trabajo',
      description: 'Constancia de abandono de trabajo del colaborador',
      icon: 'bi-file-earmark-pdf',
      filePath: '/formatos/constancia de abandono de trabajo.pdf',
      fileName: 'Constancia de Abandono de Trabajo.pdf'
    },
    {
      key: 'contrato-confidencialidad',
      label: 'Contrato de Confidencialidad',
      description: 'Contrato de confidencialidad del colaborador',
      icon: 'bi-file-earmark-pdf',
      filePath: '/formatos/CONTRATO CONFIDENCIALIDAD.pdf',
      fileName: 'Contrato de Confidencialidad.pdf'
    }
  ];

  downloadFormat(format: FormatItem): void {
    const link = document.createElement('a');
    link.href = format.filePath;
    link.download = format.fileName;
    link.click();
  }
}
