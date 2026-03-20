import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface CartaResponsivaLeySillaFila {
  id: string;
  nombre: string;
  puesto: string;
  obra: string;
  sillas: string;
  fecha: string;
}

export interface CartaResponsivaLeySillaData {
  filas: CartaResponsivaLeySillaFila[];
}

@Injectable({
  providedIn: 'root'
})
export class ReportCartaResponsivaLeySillaService {

  async generate(data: CartaResponsivaLeySillaData): Promise<void> {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const logoBase64 = await this.loadLogoBase64();

    this.drawDocument(doc, logoBase64, data);

    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    doc.save(`CartaResponsivaLeySilla_${today}.pdf`);
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

  private drawDocument(doc: jsPDF, logoBase64: string | null, data: CartaResponsivaLeySillaData): void {
    const lm = this.LM;
    const pw = this.PW;

    // ── Header ───────────────────────────────────────────────────────────────
    if (logoBase64) {
      doc.addImage(logoBase64, 'PNG', lm, 10, 18, 18);
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    // Centrar nombre verticalmente con el logo (logo: y=10, h=18 → centro=19)
    doc.text('INTEC DE JALISCO S.A. DE C.V.', lm + 29, 26);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('CARTA RESPONSIVA LEY SILLA', 105, 36, { align: 'center' });

    let y = 46;

    // ── Párrafo 1 (justificado) ───────────────────────────────────────────────
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const lh = 4.5;
    const p1Lines = doc.splitTextToSize(
      'Con la presente acta se pone a disposición de los trabajadores una silla con la finalidad de cumplir con las disposiciones generales en la LFT y la STPS aún no establecido en las normatividades vigentes.',
      pw
    );
    y = this.drawJustified(doc, p1Lines, lm, y, pw, lh);
    y += 5;

    // ── Párrafo 2 (justificado) ───────────────────────────────────────────────
    const p2Lines = doc.splitTextToSize(
      'El trabajador manifiesta que cuenta con una silla en obra para poder tomar uno o dos descansos durante su jornada laboral y se compromete a cuidar de ella como lo hace con el material, herramienta y PPP que le ofrece la empresa para realizar su trabajo con esmero y seguridad.',
      pw
    );
    y = this.drawJustified(doc, p2Lines, lm, y, pw, lh);
    y += 5;

    // ── Firmando ─────────────────────────────────────────────────────────────
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Firmando de conformidad el presente en Guadalajara, Jalisco:', lm, y);
    y += 8;

    // ── Tabla ────────────────────────────────────────────────────────────────
    const rows = data.filas.map(f => [
      f.id,
      f.nombre,
      f.puesto,
      f.obra,
      f.sillas,
      f.fecha,
      '',
    ]);

    autoTable(doc, {
      startY: y,
      margin: { left: lm, right: lm },
      tableWidth: pw,
      theme: 'grid',
      styles: {
        fontSize: 7,
        cellPadding: 2,
        valign: 'middle',
        textColor: [0, 0, 0],
        lineColor: [0, 0, 0],
        lineWidth: 0.3,
        minCellHeight: 7,
      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        halign: 'center',
      },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        1: { cellWidth: 45, halign: 'left' },
        2: { cellWidth: 30, halign: 'left' },
        3: { cellWidth: 30, halign: 'left' },
        4: { cellWidth: 15, halign: 'center' },
        5: { cellWidth: 20, halign: 'center' },
        6: { cellWidth: 25, halign: 'center' },
      },
      head: [
        ['ID', 'NOMBRE', 'PUESTO', 'OBRA', 'SILLAS', 'FECHA', 'FIRMA'],
      ],
      body: rows,
    });
  }

  private drawJustified(doc: jsPDF, lines: string[], x: number, y: number, pw: number, lh: number): number {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const isLast = i === lines.length - 1;
      const words = line.trim().split(' ');
      if (isLast || words.length <= 1) {
        doc.text(line, x, y);
      } else {
        const lw = doc.getTextWidth(line.trim());
        const sp = (pw - lw + doc.getTextWidth(' ') * (words.length - 1)) / (words.length - 1);
        let cx = x;
        for (const word of words) {
          doc.text(word, cx, y);
          cx += doc.getTextWidth(word) + sp;
        }
      }
      y += lh;
    }
    return y;
  }
}
