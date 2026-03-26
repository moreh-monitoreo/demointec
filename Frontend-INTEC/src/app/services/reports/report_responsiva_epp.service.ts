import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';

export interface EppRow {
  cantidad: string;
  descripcion: string;
  talla: string;
  color: string;
  marca: string;
}

export interface ResponsivaEppData {
  fecha: string;
  nombre: string;
  ciudad: string;
  estado: string;
  filas: EppRow[];
}

@Injectable({
  providedIn: 'root'
})
export class ReportResponsivaEppService {

  async generate(data: ResponsivaEppData): Promise<void> {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const logoBase64 = await this.loadLogoBase64();

    this.drawDocument(doc, data, logoBase64);

    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    doc.save(`ResponsivaEPP_${today}.pdf`);
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

  private formatDate(d: string): string {
    if (!d) return '';
    const [y, m, day] = d.split('-');
    return `${day}/${m}/${y}`;
  }

  private drawDocument(doc: jsPDF, data: ResponsivaEppData, logoBase64: string | null): void {
    const lm = 20;
    const rm = 20;
    const pw = 210 - lm - rm;
    const dark: [number, number, number] = [20, 20, 20];
    const fs = 10;
    const lh = 5.8;

    // ── Borde exterior ────────────────────────────────────────────────────────
    doc.setDrawColor(dark[0], dark[1], dark[2]);
    doc.setLineWidth(0.5);
    doc.rect(lm - 5, 8, pw + 10, 270, 'S');

    // ── Logo ──────────────────────────────────────────────────────────────────
    if (logoBase64) {
      doc.addImage(logoBase64, 'PNG', lm, 14, 18, 18);
    }

    // ── Nombre empresa ────────────────────────────────────────────────────────
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(dark[0], dark[1], dark[2]);
    doc.text('INTEC DE JALISCO S.A. DE C.V.', lm + 26, 25);

    // ── Título ────────────────────────────────────────────────────────────────
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('CARTA RESPONSIVA DE EPP', 105, 44, { align: 'center' });

    let y = 58;

    // ── FECHA ─────────────────────────────────────────────────────────────────
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(fs);
    doc.setTextColor(dark[0], dark[1], dark[2]);
    doc.text('FECHA:', lm, y);
    const fechaLabelW = doc.getTextWidth('FECHA: ');
    doc.setFont('helvetica', 'normal');
    const fechaFormatted = this.formatDate(data.fecha);
    doc.text(fechaFormatted, lm + fechaLabelW + 2, y);
    // Línea subrayado
    doc.setLineWidth(0.3);
    doc.setDrawColor(dark[0], dark[1], dark[2]);
    doc.line(lm + fechaLabelW, y + 1, lm + fechaLabelW + 55, y + 1);
    y += lh + 5;

    // ── NOMBRE EMPLEADO ───────────────────────────────────────────────────────
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(fs);
    doc.text('NOMBRE EMPLEADO', lm, y);
    const nombreLabelW = doc.getTextWidth('NOMBRE EMPLEADO ');
    doc.setFont('helvetica', 'normal');
    doc.text(data.nombre, lm + nombreLabelW + 2, y);
    // Línea subrayado que ocupa el resto de la línea
    doc.setLineWidth(0.3);
    doc.line(lm + nombreLabelW, y + 1, lm + pw, y + 1);
    y += lh + 4;

    // ── Texto introductorio ───────────────────────────────────────────────────
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fs);
    const intro = 'Con la presente acta se le hace entrega de la siguiente dotación de uniformes:';
    doc.text(intro, lm, y);
    y += lh + 6;

    // ── Tabla EPP ─────────────────────────────────────────────────────────────
    const colCantidad = 22;
    const colDescripcion = 55;
    const colTalla = 22;
    const colColor = 28;
    const colMarca = pw - colCantidad - colDescripcion - colTalla - colColor;
    const tableX = lm;
    const hdrH = 8;
    const rowH = 8;
    const numRows = 5;

    // Header de tabla
    const cols = [
      { label: 'Cantidad', w: colCantidad },
      { label: 'Descripción', w: colDescripcion },
      { label: 'Talla', w: colTalla },
      { label: 'Color', w: colColor },
      { label: 'Marca', w: colMarca },
    ];

    doc.setDrawColor(dark[0], dark[1], dark[2]);
    doc.setLineWidth(0.3);

    let cx = tableX;
    for (const col of cols) {
      doc.rect(cx, y, col.w, hdrH, 'S');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(dark[0], dark[1], dark[2]);
      doc.text(col.label, cx + col.w / 2, y + hdrH / 2 + 1.5, { align: 'center' });
      cx += col.w;
    }
    y += hdrH;

    // Filas con datos
    const filas = data.filas ?? [];
    for (let r = 0; r < numRows; r++) {
      const fila = filas[r];
      cx = tableX;
      const vals = fila ? [fila.cantidad, fila.descripcion, fila.talla, fila.color, fila.marca] : ['', '', '', '', ''];
      for (let ci = 0; ci < cols.length; ci++) {
        doc.rect(cx, y, cols[ci].w, rowH, 'S');
        if (vals[ci]) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(dark[0], dark[1], dark[2]);
          doc.text(String(vals[ci]), cx + cols[ci].w / 2, y + rowH / 2 + 1.5, { align: 'center' });
        }
        cx += cols[ci].w;
      }
      y += rowH;
    }
    y += 6;

    // ── Párrafo 1 ─────────────────────────────────────────────────────────────
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fs);
    doc.setTextColor(dark[0], dark[1], dark[2]);
    const p1 = 'El trabajador manifiesta que: La dotación de uniformes que aquí se entrega es y será utilizado dentro de la empresa en todo momento, en caso de terminación del contrato de trabajo antes de los 3 meses se realizará el descuento total del EPP que se le haya otorgado.';
    const p1Lines = doc.splitTextToSize(p1, pw);
    y = this.drawJustified(doc, p1Lines, lm, y, pw, lh);
    y += 4;

    // ── Párrafo 2 ─────────────────────────────────────────────────────────────
    const p2pre = 'En caso de daño del EPP, por negligencia del trabajador este será reemplazado bajo el costo que la empresa determine y con la forma de pago que esta señale, ';
    const p2bold = 'autorizando';
    const p2post = ' expresamente a la empresa a descontar de salarios y/o finiquito.';

    const p2full = p2pre + p2bold + p2post;
    const p2Lines = doc.splitTextToSize(p2full, pw);
    y = this.drawJustified(doc, p2Lines, lm, y, pw, lh);
    y += 4;

    // ── Párrafo 3 ─────────────────────────────────────────────────────────────
    const p3 = 'El reemplazo se realizará dentro del periodo de 6 meses, o bajo los casos que por desgaste o daños de fabricación a valoración del mismo.';
    const p3Lines = doc.splitTextToSize(p3, pw);
    y = this.drawJustified(doc, p3Lines, lm, y, pw, lh);
    y += 6;

    // ── Firmando ──────────────────────────────────────────────────────────────
    const firma = `Firmando de conformidad el presente en ${data.ciudad || 'Guadalajara'}, ${data.estado || 'Jalisco'}:`;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fs);
    doc.text(firma, lm, y);
    y += lh + 18;

    // ── Firmas ────────────────────────────────────────────────────────────────
    const sigLabels = ['TRABAJADOR', 'ING. RESIDENTE', 'R.H.'];
    const sigSpacing = pw / 3;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    for (let i = 0; i < 3; i++) {
      const sx = lm + i * sigSpacing + sigSpacing / 2;
      doc.text(sigLabels[i], sx, y, { align: 'center' });
    }
    y += 14;

    // Líneas de firma
    doc.setLineWidth(0.4);
    doc.setDrawColor(dark[0], dark[1], dark[2]);
    for (let i = 0; i < 3; i++) {
      const sx = lm + i * sigSpacing + sigSpacing / 2;
      doc.line(sx - 25, y, sx + 25, y);
    }
  }

  private drawJustified(doc: jsPDF, lines: string[], x: number, y: number, pw: number, lineH: number): number {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const isLast = i === lines.length - 1;
      if (isLast || line.trim().split(' ').length <= 1) {
        doc.text(line, x, y);
      } else {
        const words = line.trim().split(' ');
        const lw = doc.getTextWidth(line.trim());
        const sp = (pw - lw + doc.getTextWidth(' ') * (words.length - 1)) / (words.length - 1);
        let cx = x;
        for (const word of words) {
          doc.text(word, cx, y);
          cx += doc.getTextWidth(word) + sp;
        }
      }
      y += lineH;
    }
    return y;
  }
}
