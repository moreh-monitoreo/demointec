import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';

export interface SolicitudPrestamoData {
  duenioOperativo: string;
  duenioEjecutivo: string;
  fechaAprobacion: string;
  entradaVigencia: string;
  nombre: string;
  puesto: string;
  fechaIngreso: string;
  montoSolicitado: string;
  montoAutorizado: string;
  motivoPrestamo: string;
  formaPago: string;
  numPagos: string | number;
  fechaInicioPago: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReportSolicitudPrestamoService {

  async generate(data: SolicitudPrestamoData): Promise<void> {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const logoBase64 = await this.loadLogoBase64();
    this.drawDocument(doc, data, logoBase64);
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    doc.save(`SolicitudPrestamo_${today}.pdf`);
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

  private generatePaymentDates(fechaInicio: string, numPagos: number | string, formaPago: string): Date[] {
    numPagos = parseInt(String(numPagos), 10);
    const dates: Date[] = [];
    if (!fechaInicio || numPagos <= 0) return dates;

    const parts = fechaInicio.split('/');
    if (parts.length !== 3) return dates;

    let current = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
    if (isNaN(current.getTime())) return dates;

    for (let i = 0; i < numPagos; i++) {
      dates.push(new Date(current));
      if (formaPago === 'Semanal') {
        current.setDate(current.getDate() + 7);
      } else if (formaPago === 'Quincenal') {
        current.setDate(current.getDate() + 15);
      } else {
        current.setMonth(current.getMonth() + 1);
      }
    }
    return dates;
  }

  private formatDate(d: Date): string {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = String(d.getFullYear());
    return `${dd}/${mm}/${yyyy}`;
  }

  private drawDocument(doc: jsPDF, data: SolicitudPrestamoData, logoBase64: string | null): void {
    const lm = 15;
    const pw = 180;
    const orange: [number, number, number] = [230, 100, 20];
    const white: [number, number, number] = [255, 255, 255];
    const black: [number, number, number] = [20, 20, 20];
    const fs = 9;

    // ── Marco exterior ────────────────────────────────────────────────────────
    doc.setDrawColor(...black);
    doc.setLineWidth(0.4);
    doc.rect(lm - 3, 5, pw + 6, 287);

    // ── Logo ─────────────────────────────────────────────────────────────────
    if (logoBase64) {
      doc.addImage(logoBase64, 'PNG', lm, 12, 18, 18);
    }

    // ── Header table ─────────────────────────────────────────────────────────
    const tableX = lm + 22;
    const tableW = pw - 25;
    const col1W = tableW * 0.3;
    const col2W = tableW * 0.3;
    const col3W = tableW * 0.2;
    const col4W = tableW - col1W - col2W - col3W;

    // Title row
    doc.setFillColor(...orange);
    doc.rect(tableX, 8, tableW, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...white);
    doc.text('Formato Solicitud de Préstamo', tableX + tableW / 2, 13.5, { align: 'center' });

    // Sub-header row labels
    const row2Y = 16;
    doc.setFillColor(...orange);
    doc.rect(tableX, row2Y, col1W, 6, 'F');
    doc.rect(tableX + col1W, row2Y, col2W, 6, 'F');
    doc.rect(tableX + col1W + col2W, row2Y, col3W, 6, 'F');
    doc.rect(tableX + col1W + col2W + col3W, row2Y, col4W, 6, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...white);
    doc.text('Dueño Operativo', tableX + col1W / 2, row2Y + 4, { align: 'center' });
    doc.text('Dueño Ejecutivo', tableX + col1W + col2W / 2, row2Y + 4, { align: 'center' });
    doc.text('Fecha de aprobación', tableX + col1W + col2W + col3W / 2, row2Y + 4, { align: 'center' });
    doc.text('Entrada en vigor', tableX + col1W + col2W + col3W + col4W / 2, row2Y + 4, { align: 'center' });

    // Sub-header values row
    const row3Y = 22;
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.3);
    doc.rect(tableX, row3Y, col1W, 8);
    doc.rect(tableX + col1W, row3Y, col2W, 8);
    doc.rect(tableX + col1W + col2W, row3Y, col3W, 8);
    doc.rect(tableX + col1W + col2W + col3W, row3Y, col4W, 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...black);
    const opLines = doc.splitTextToSize(data.duenioOperativo || '', col1W - 2);
    doc.text(opLines, tableX + col1W / 2, row3Y + 5 - (opLines.length > 1 ? 1.5 : 0), { align: 'center' });
    const ejLines = doc.splitTextToSize(data.duenioEjecutivo || '', col2W - 2);
    doc.text(ejLines, tableX + col1W + col2W / 2, row3Y + 5 - (ejLines.length > 1 ? 1.5 : 0), { align: 'center' });
    doc.text(data.fechaAprobacion || '', tableX + col1W + col2W + col3W / 2, row3Y + 5, { align: 'center' });
    doc.text(data.entradaVigencia || '', tableX + col1W + col2W + col3W + col4W / 2, row3Y + 5, { align: 'center' });

    // Bottom orange border
    doc.setFillColor(...orange);
    doc.rect(lm, 31, pw, 1.5, 'F');

    let y = 40;

    // ── Title ─────────────────────────────────────────────────────────────────
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...black);
    doc.text('Formato Solicitud de Préstamo', lm + pw / 2, y, { align: 'center' });
    y += 10;

    // ── DATOS DEL SOLICITANTE ─────────────────────────────────────────────────
    doc.setFillColor(...orange);
    doc.rect(lm, y, pw, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...white);
    doc.text('DATOS DEL SOLICITANTE', lm + pw / 2, y + 5, { align: 'center' });
    y += 12;

    // Nombre
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fs);
    doc.setTextColor(...black);
    doc.text('Nombre:', lm, y);
    doc.setLineWidth(0.3);
    doc.setDrawColor(100, 100, 100);
    doc.line(lm + 18, y + 0.5, lm + pw, y + 0.5);
    doc.text(data.nombre || '', lm + 20, y);
    y += 8;

    // Puesto + Fecha ingreso
    doc.text('Puesto:', lm, y);
    doc.line(lm + 16, y + 0.5, lm + pw * 0.45, y + 0.5);
    doc.text(data.puesto || '', lm + 18, y);
    doc.text('Fecha de ingreso:', lm + pw * 0.5, y);
    doc.line(lm + pw * 0.5 + 34, y + 0.5, lm + pw, y + 0.5);
    doc.text(data.fechaIngreso || '', lm + pw * 0.5 + 36, y);
    y += 12;

    // ── INFORMACIÓN DEL PRÉSTAMO ──────────────────────────────────────────────
    doc.setFillColor(...orange);
    doc.rect(lm, y, pw, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...white);
    doc.text('INFORMACIÓN DEL PRÉSTAMO', lm + pw / 2, y + 5, { align: 'center' });
    y += 12;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fs);
    doc.setTextColor(...black);

    // Monto solicitado + autorizado
    doc.text('Monto solicitado: $', lm, y);
    doc.line(lm + 37, y + 0.5, lm + pw * 0.45, y + 0.5);
    doc.text(data.montoSolicitado || '', lm + 39, y);
    doc.text('Monto autorizado: $', lm + pw * 0.5, y);
    doc.line(lm + pw * 0.5 + 38, y + 0.5, lm + pw, y + 0.5);
    doc.text(data.montoAutorizado || '', lm + pw * 0.5 + 40, y);
    y += 8;

    // Motivo
    doc.text('Motivo de solicitud de préstamo:', lm, y);
    doc.line(lm + 60, y + 0.5, lm + pw, y + 0.5);
    doc.text(data.motivoPrestamo || '', lm + 62, y);
    y += 8;

    // Forma de pago
    doc.text('Forma de pago:', lm, y);
    const formas = ['Semanal', 'Quincenal', 'Mensual'];
    let fx = lm + 30;
    for (const forma of formas) {
      doc.setDrawColor(100, 100, 100);
      doc.setLineWidth(0.3);
      doc.rect(fx, y - 3.5, 4, 4);
      if (data.formaPago === forma) {
        doc.setFillColor(230, 100, 20);
        doc.rect(fx + 0.5, y - 3, 3, 3, 'F');
      }
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(fs);
      doc.setTextColor(...black);
      doc.text(forma, fx + 5.5, y);
      fx += 30;
    }
    y += 8;

    // Num pagos + fecha inicio
    const numPagos = parseInt(String(data.numPagos || '0'), 10);
    doc.text('Número de pagos a realizar:', lm, y);
    doc.setDrawColor(100, 100, 100);
    doc.rect(lm + 52, y - 3.5, 12, 5);
    doc.text(String(numPagos || ''), lm + 52 + 6, y - 0.5, { align: 'center' });
    doc.text('Fecha de inicio de primer descuento:', lm + pw * 0.48, y);
    doc.line(lm + pw * 0.48 + 68, y + 0.5, lm + pw, y + 0.5);
    doc.text(data.fechaInicioPago || '__ /__ /____', lm + pw * 0.48 + 70, y);
    y += 10;

    // ── Tabla de pagos ────────────────────────────────────────────────────────
    const monto = parseFloat(String(data.montoAutorizado || '0').replace(/,/g, ''));
    const montoPorPago = numPagos > 0 && !isNaN(monto) ? (monto / numPagos).toFixed(2) : '';
    const payDates = this.generatePaymentDates(data.fechaInicioPago || '', numPagos, data.formaPago || 'Semanal');

    const labelW      = 17;
    const fechaLineW  = 35;
    const montoLabelW = 18;
    const montoLineW  = 30;
    const rowH        = 7;
    const pageH       = 297;
    const marginBot   = 40; // espacio reservado para firmas + footer

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fs);

    for (let i = 0; i < numPagos; i++) {
      // Salto de página si no cabe la fila + espacio de firmas
      if (y + rowH > pageH - marginBot) {
        this.drawFooterAndFrame(doc, lm, pw, orange, black, doc.getNumberOfPages());
        doc.addPage();
        this.drawFrame(doc, lm, pw, black);
        y = 20;
      }

      const fechaStr = payDates[i] ? this.formatDate(payDates[i]) : '__/__/____';
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(fs);
      doc.setTextColor(...black);
      doc.setDrawColor(100, 100, 100);
      doc.setLineWidth(0.3);

      doc.text(`${i + 1}.- Pago:`, lm, y);
      doc.line(lm + labelW, y + 0.5, lm + labelW + fechaLineW, y + 0.5);
      doc.text(fechaStr, lm + labelW + 1, y);
      const mX = lm + labelW + fechaLineW + 8;
      doc.text('Monto: $', mX, y);
      doc.line(mX + montoLabelW, y + 0.5, mX + montoLabelW + montoLineW, y + 0.5);
      if (montoPorPago) doc.text(montoPorPago, mX + montoLabelW + 1, y);

      y += rowH;
    }

    y += 14;

    // ── Firmas ────────────────────────────────────────────────────────────────
    if (y + 25 > pageH - 16) {
      this.drawFooterAndFrame(doc, lm, pw, orange, black, doc.getNumberOfPages());
      doc.addPage();
      this.drawFrame(doc, lm, pw, black);
      y = 20;
    }

    const sig1X = lm + pw * 0.12;
    const sig2X = lm + pw * 0.5;
    const sig3X = lm + pw * 0.85;
    const sigHW = 30;

    doc.setLineWidth(0.4);
    doc.setDrawColor(80, 80, 80);
    doc.line(sig1X - sigHW / 2, y, sig1X + sigHW / 2, y);
    doc.line(sig2X - sigHW / 2, y, sig2X + sigHW / 2, y);
    doc.line(sig3X - sigHW / 2, y, sig3X + sigHW / 2, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...black);
    doc.text('Firma del Solicitante', sig1X, y + 5, { align: 'center' });
    doc.text('Autorización administración', sig2X, y + 5, { align: 'center' });
    doc.text('Autorización operaciones', sig3X, y + 5, { align: 'center' });

    // ── Footer última página ───────────────────────────────────────────────────
    this.drawFooterAndFrame(doc, lm, pw, orange, black, doc.getNumberOfPages());
  }

  private drawFrame(doc: jsPDF, lm: number, pw: number, black: [number, number, number]): void {
    doc.setDrawColor(...black);
    doc.setLineWidth(0.4);
    doc.rect(lm - 3, 5, pw + 6, 287);
  }

  private drawFooterAndFrame(
    doc: jsPDF, lm: number, pw: number,
    orange: [number, number, number], black: [number, number, number],
    pageNum: number
  ): void {
    const pageH = 297;
    const footerY = pageH - 10;
    doc.setFillColor(...orange);
    doc.rect(lm, footerY - 2, pw, 1.5, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...black);
    doc.text('INTEC de Jalisco S.A. de C.V.', lm + pw * 0.4, footerY + 2, { align: 'center' });
    doc.text(`Página ${pageNum}`, lm + pw, footerY + 2, { align: 'right' });
  }
}
