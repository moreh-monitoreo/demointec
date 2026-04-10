import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';

export interface SolicitudBonoRecomendacionData {
  nombreEmpleado: string;
  fechaIngreso: string;
  personaRecomendada: string;
  fechaContratacion: string;
  bono: string | number;
  fechaPago: string;
  observaciones: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReportSolicitudBonoRecomendacionService {

  async generate(data: SolicitudBonoRecomendacionData): Promise<void> {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const logoBase64 = await this.loadLogoBase64();

    // 2 copias por hoja A4 (297mm)
    const slotHeight = 148;
    for (let i = 0; i < 2; i++) {
      const offsetY = i * slotHeight;
      this.drawCopy(doc, data, logoBase64, offsetY);
      if (i < 1) {
        doc.setDrawColor(0, 0, 200);
        doc.setLineWidth(0.3);
        doc.setLineDashPattern([2, 2], 0);
        doc.line(10, offsetY + slotHeight, 200, offsetY + slotHeight);
        doc.setLineDashPattern([], 0);
      }
    }

    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    doc.save(`SolicitudBonoRecomendacion_${today}.pdf`);
  }

  private async loadLogoBase64(): Promise<string | null> {
    try {
      const response = await fetch('/assets/logo.png');
      const blob = await response.blob();
      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  }

  private roundRect(
    doc: jsPDF,
    x: number, y: number, w: number, h: number,
    r: number,
    style: 'F' | 'S' | 'FD' = 'FD'
  ): void {
    doc.roundedRect(x, y, w, h, r, r, style);
  }

  private drawCopy(
    doc: jsPDF,
    data: SolicitudBonoRecomendacionData,
    logoBase64: string | null,
    offsetY: number
  ): void {
    const lm = 12;
    const pw = 186;
    const blue: [number, number, number] = [0, 0, 200];
    const black: [number, number, number] = [20, 20, 20];
    const gray: [number, number, number] = [220, 220, 220];
    const darkGray: [number, number, number] = [160, 160, 160];
    const white: [number, number, number] = [255, 255, 255];

    const gap = 3; // espacio entre secciones
    let y = offsetY + 4;

    // ── Logo ──────────────────────────────────────────────────────────────────
    if (logoBase64) {
      doc.addImage(logoBase64, 'PNG', lm, y + 1, 16, 16);
    }

    // ── Encabezado empresa ───────────────────────────────────────────────────
    const hx = lm + 20;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...black);
    doc.text('INTEC DE JALIS CO, S.A. DE C.V.', hx, y + 4);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.text('MISIONEROS  #2138', hx, y + 8);
    doc.text('C.P. 44210', hx + 44, y + 8);
    doc.text('COL. JARDINES DEL COUNTRY', hx, y + 12);
    doc.text('GUADALAJARA, JALISCO', hx, y + 16);

    y += 20;

    // ── Título azul subrayado ─────────────────────────────────────────────────
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...blue);
    doc.text('SOLICITUD DE BONO POR RECOMENDACIÓN', lm + pw / 2, y, { align: 'center' });
    y += 2;

    doc.setDrawColor(...blue);
    doc.setLineWidth(0.4);
    const titleW = doc.getTextWidth('SOLICITUD DE BONO POR RECOMENDACIÓN');
    doc.line(lm + pw / 2 - titleW / 2, y, lm + pw / 2 + titleW / 2, y);
    y += 4 + gap;

    // ── DATOS DE EMPLEADO ─────────────────────────────────────────────────────
    doc.setFillColor(...gray);
    doc.setDrawColor(...darkGray);
    doc.setLineWidth(0.3);
    this.roundRect(doc, lm, y, pw, 5, 1.5, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...black);
    doc.text('DATOS DE EMPLEADO', lm + pw / 2, y + 3.5, { align: 'center' });
    y += 5;

    // ── Fila Empleado | Fecha de ingreso ──────────────────────────────────────
    const col1 = pw * 0.65;
    const rowH = 8;

    doc.setFillColor(...white);
    doc.setDrawColor(...darkGray);
    doc.setLineWidth(0.3);
    this.roundRect(doc, lm, y, pw, rowH, 1.5, 'FD');
    doc.setDrawColor(...darkGray);
    doc.line(lm + col1, y + 1, lm + col1, y + rowH - 1);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...blue);
    doc.text('Empleado:', lm + 2, y + 5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...black);
    doc.text(data.nombreEmpleado || '', lm + 22, y + 5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...blue);
    doc.text('Fecha de', lm + col1 + 2, y + 3.2);
    doc.text('ingreso:', lm + col1 + 2, y + 6.8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...black);
    doc.text(data.fechaIngreso || '', lm + col1 + 20, y + 5);
    y += rowH + gap;

    // ── Persona recomendada — label gris ─────────────────────────────────────
    doc.setFillColor(...gray);
    doc.setDrawColor(...darkGray);
    doc.setLineWidth(0.3);
    this.roundRect(doc, lm, y, pw, 5, 1.5, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...blue);
    doc.text('Persona recomendada:', lm + 2, y + 3.5);
    y += 5;

    // Valor persona recomendada — blanco
    doc.setFillColor(...white);
    doc.setDrawColor(...darkGray);
    this.roundRect(doc, lm, y, pw, 5, 1.5, 'FD');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...black);
    doc.text(data.personaRecomendada || '', lm + 3, y + 3.5);
    y += 5 + gap;

    // ── Cabecera 3 columnas — gris redondeada ─────────────────────────────────
    const c1 = pw / 3;
    const c2 = pw / 3;
    const c3 = pw - c1 - c2;

    doc.setFillColor(...gray);
    doc.setDrawColor(...darkGray);
    doc.setLineWidth(0.3);
    this.roundRect(doc, lm, y, pw, 5, 1.5, 'FD');
    doc.line(lm + c1, y + 1, lm + c1, y + 4);
    doc.line(lm + c1 + c2, y + 1, lm + c1 + c2, y + 4);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(...blue);
    doc.text('Fecha contratación', lm + c1 / 2, y + 3.3, { align: 'center' });
    doc.text('Bono $', lm + c1 + c2 / 2, y + 3.3, { align: 'center' });
    doc.text('Fecha de pago:', lm + c1 + c2 + c3 / 2, y + 3.3, { align: 'center' });
    y += 5;

    // Fila de valores — blanco redondeado
    doc.setFillColor(...white);
    doc.setDrawColor(...darkGray);
    this.roundRect(doc, lm, y, pw, 6, 1.5, 'FD');
    doc.line(lm + c1, y + 1, lm + c1, y + 5);
    doc.line(lm + c1 + c2, y + 1, lm + c1 + c2, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...black);
    doc.text(data.fechaContratacion || '', lm + c1 / 2, y + 4, { align: 'center' });
    doc.text(String(data.bono ?? ''), lm + c1 + c2 / 2, y + 4, { align: 'center' });
    doc.text(data.fechaPago || '', lm + c1 + c2 + c3 / 2, y + 4, { align: 'center' });
    y += 6 + gap;

    // ── Observaciones ─────────────────────────────────────────────────────────
    doc.setFillColor(...gray);
    doc.setDrawColor(...darkGray);
    doc.setLineWidth(0.3);
    this.roundRect(doc, lm, y, pw, 5.5, 1.5, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...blue);
    doc.text('Observaciones:', lm + 2, y + 3.8);
    y += 5.5;

    // Valor observaciones — blanco
    doc.setFillColor(...white);
    doc.setDrawColor(...darkGray);
    this.roundRect(doc, lm, y, pw, 5, 1.5, 'FD');
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...black);
    doc.setFontSize(6.5);
    const obsText = doc.splitTextToSize(data.observaciones || '', pw - 6);
    doc.text(obsText[0] || '', lm + 3, y + 3.5);
    y += 5 + gap * 3;

    // ── Bloques de firma ──────────────────────────────────────────────────────
    const sigW = pw * 0.38;
    const sigH = 24;
    const sig1X = lm + pw * 0.06;
    const sig2X = lm + pw * 0.56;

    // Firma izquierda
    doc.setFillColor(...white);
    doc.setDrawColor(...darkGray);
    doc.setLineWidth(0.3);
    this.roundRect(doc, sig1X, y, sigW, sigH, 1.5, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(...blue);
    doc.text('Aprobada: Jefe directo', sig1X + sigW / 2, y + 4.5, { align: 'center' });
    doc.text('Encargado de obra / Residente', sig1X + sigW / 2, y + 8, { align: 'center' });
    doc.setDrawColor(...gray);
    doc.setLineWidth(0.3);
    doc.line(sig1X + 4, y + 19, sig1X + sigW - 4, y + 19);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(...blue);
    doc.text('Firma', sig1X + sigW / 2, y + 23, { align: 'center' });

    // Firma derecha
    doc.setFillColor(...white);
    doc.setDrawColor(...darkGray);
    doc.setLineWidth(0.3);
    this.roundRect(doc, sig2X, y, sigW, sigH, 1.5, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(...blue);
    doc.text('Enterado', sig2X + sigW / 2, y + 4.5, { align: 'center' });
    doc.setDrawColor(...gray);
    doc.setLineWidth(0.3);
    doc.line(sig2X + 4, y + 19, sig2X + sigW - 4, y + 19);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(...blue);
    doc.text('Firma de R.H.', sig2X + sigW / 2, y + 23, { align: 'center' });
  }
}
