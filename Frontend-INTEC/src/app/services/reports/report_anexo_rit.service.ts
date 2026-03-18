import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface AnexoRitData {
  nombreRepresentante: string;
  nombreTrabajador: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReportAnexoRitService {

  async generate(data: AnexoRitData): Promise<void> {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const logoBase64 = await this.loadLogoBase64();

    this.drawDocument(doc, data, logoBase64);

    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    doc.save(`AnexoRIT_${today}.pdf`);
  }

  private async loadLogoBase64(): Promise<string | null> {
    try {
      const response = await fetch('/assets/logo_gris.png');
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

  private readonly LM = 15;
  private readonly PW = 180;

  private drawDocument(doc: jsPDF, data: AnexoRitData, logoBase64: string | null): void {
    // ── Header ──────────────────────────────────────────────────────────────
    if (logoBase64) {
      doc.addImage(logoBase64, 'PNG', this.LM, 10, 25, 18);
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('ANEXO 1 LISTADO DE SANCIONES POR INFRACCIÓN', 105, 16, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('AL REGLAMENTO INTERNO DE TRABAJO', 105, 23, { align: 'center' });

    let y = 32;

    // ── Main table ──────────────────────────────────────────────────────────
    autoTable(doc, {
      startY: y,
      margin: { left: this.LM, right: this.LM },
      tableWidth: this.PW,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2,
        valign: 'middle',
        textColor: [0, 0, 0],
        lineColor: [0, 0, 0],
        lineWidth: 0.3,
      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        halign: 'center',
      },
      columnStyles: {
        0: { cellWidth: 35, halign: 'center', fontStyle: 'italic' },
        1: { cellWidth: 72.5, halign: 'center' },
        2: { cellWidth: 72.5, halign: 'center' },
      },
      head: [
        [
          { content: 'TIPO DE FALTA', rowSpan: 2, styles: { valign: 'middle' } },
          { content: 'SANCIÓN', colSpan: 2, styles: { halign: 'center' } },
        ],
        [
          { content: '1er Acta Administrativa', styles: { fontStyle: 'bold', halign: 'center' } },
          { content: '2da Acta Administrativa', styles: { fontStyle: 'bold', halign: 'center' } },
        ],
      ],
      body: [
        [
          {
            content: 'Incumplimiento u omisión del RIT.',
            rowSpan: 3,
            styles: { valign: 'middle', fontStyle: 'italic', fillColor: [235, 245, 235] },
          },
          {
            content: 'Personal operativo y administrativo: Se detiene el pago del bono económico correspondiente a la semana de la falta.',
            styles: { halign: 'center' },
          },
          {
            content: 'Personal operativo y administrativo: Se suspende el pago de bono económico por 3 semanas continuas.',
            styles: { halign: 'center' },
          },
        ],
        [
          { content: '3er Acta Administrativa', styles: { fontStyle: 'bold', halign: 'center' } },
          { content: '4ta Acta Administrativa', styles: { fontStyle: 'bold', halign: 'center' } },
        ],
        [
          {
            content: 'Personal operativo y administrativo: Se suspende el pago de bono económico durante 5 semanas continuas.',
            styles: { halign: 'center' },
          },
          {
            content: 'Personal operativo y administrativo: Suspención de hasta 8 días sin goce de sueldo o rescisión de contrato sin responsabilidad para el patrón de acuerdo al art. 47 de la LFT',
            styles: { halign: 'center' },
          },
        ],
      ],
    });

    y = (doc as any).lastAutoTable.finalY + 6;

    // ── Notice paragraph 1 (sin marco) ──────────────────────────────────────
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);

    const p1Lines = doc.splitTextToSize(
      'Las acciones se tomarán con respecto a cada falta cometida, tambien dependerá de desempeño, actitud, antigüedad y factores que intervengan en el cumplimiento de la responsabilidad del puesto para el cual fue contratado el trabajador. La aplicación de este anexo es a partir de su firma y conocimiento del mismo.',
      this.PW
    );
    doc.text(p1Lines, 105, y, { align: 'center' });
    y += p1Lines.length * 4.5 + 5;

    // ── Notice paragraph 2 (sin marco) ──────────────────────────────────────
    const p2Lines = doc.splitTextToSize(
      'Las sanciones se apegan completamente a la Ley Federal del Trabajo y al presente reglamento. Las amonestaciones verbales y escritas se efectuan cuando la falta no es grave. En caso de ser grave, se levanta el acta administrativa y se efectuará la sanción que corresponda a su historial del ultimo periodo de 90 días.',
      this.PW
    );
    doc.text(p2Lines, this.LM, y);
    y += p2Lines.length * 4.5 + 14;

    // ── Signature section ────────────────────────────────────────────────────
    const colW = this.PW / 2;
    const leftX = this.LM;
    const rightX = this.LM + colW;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);

    doc.text('REPRESENTANTE DEL PATRON', leftX + colW / 2, y, { align: 'center' });
    doc.text('TRABAJADOR', rightX + colW / 2, y, { align: 'center' });

    y += 18;

    doc.setLineWidth(0.4);
    doc.line(leftX + 10, y, leftX + colW - 10, y);
    doc.line(rightX + 10, y, rightX + colW - 10, y);

    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);

    doc.text(data.nombreRepresentante || 'Nombre y firma', leftX + colW / 2, y, { align: 'center' });
    doc.text(data.nombreTrabajador || 'Nombre y firma', rightX + colW / 2, y, { align: 'center' });
  }
}
