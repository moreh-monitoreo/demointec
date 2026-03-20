import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';

export interface ActaAbandonoTrabajoData {
  nombre: string;
  puesto: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReportActaAbandonoTrabajoService {

  async generate(data: ActaAbandonoTrabajoData): Promise<void> {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const logoBase64 = await this.loadLogoBase64();

    this.drawDocument(doc, data, logoBase64);

    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    doc.save(`ActaAbandonoTrabajo_${today}.pdf`);
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

  private drawDocument(doc: jsPDF, data: ActaAbandonoTrabajoData, logoBase64: string | null): void {
    const lm = 20;
    const pw = 170;
    const dark: [number, number, number] = [20, 20, 20];
    const fs = 10;
    const lh = 6;

    // ── Logo ──────────────────────────────────────────────────────────────────
    if (logoBase64) {
      doc.addImage(logoBase64, 'PNG', lm, 10, 18, 18);
    }

    // ── Nombre empresa ────────────────────────────────────────────────────────
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(dark[0], dark[1], dark[2]);
    doc.text('INTEC DE JALISCO S.A. DE C.V.', lm + 26, 24);

    // ── Título ────────────────────────────────────────────────────────────────
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('ACTA DE ABANDONO DE TRABAJO', 105, 44, { align: 'center' });

    let y = 60;

    // ── Párrafo principal con nombre y puesto en negritas ─────────────────────
    // El párrafo tiene nombre y puesto como valores variables en negritas.
    // Se construye como segmentos: [texto normal, texto bold, ...]
    const seg1 = 'En la Ciudad de Zapopan, Jalisco. Siendo las 13:00 horas del día 23 de junio del año 2025. Reunidos en las oficinas de la fuente de trabajo denominada Intec de Jalisco S.A. de C.V. ubicadas en Misioneros número 2138 Colonia Jardines del Country en Guadalajara, Jalisco con C.P.44210, representada por el C. Juan Pablo Jiménez Espinosa en su carácter de representante legal y los C. María Asunción Mares Magallanes y Luis Cervantes Contreras con el carácter de testigos y quienes son trabajadores de la misma fuente de trabajo, con el objeto de hacer constar lo siguiente: el representante de la fuente de trabajo manifiesta que el día de hoy el C. ';
    const seg2 = data.nombre;
    const seg3 = ' quien se desempeña como trabajador con la calidad de ';
    const seg4 = data.puesto;
    const seg5 = ' en la fuente de trabajo en la que se actúa. Se retiró de su lugar de trabajo obra VW Agua Azul ubicada Calz. Jesús González Gallo #450, Col. Centro. C.P.44100. Guadalajara, Jal. sin previa autorización y sin aviso alguno a su jefe directo.  Por su parte los testigos María Asunción Mares Magallanes y Luis Cervantes Contreras quienes también son trabajadores de la misma fuente de trabajo, manifiestan uno en pos de otro, estar enterados de la situación después del abandono del trabajador.';

    y = this.drawMixedJustified(doc, [
      { text: seg1, bold: false },
      { text: seg2, bold: true },
      { text: seg3, bold: false },
      { text: seg4, bold: true },
      { text: seg5, bold: false },
    ], lm, y, pw, lh, fs, dark);

    y += 8;

    // ── Párrafo de cierre ─────────────────────────────────────────────────────
    const cierre = 'No habiendo más asuntos que tratar, se da por concluida la presente acta, firmando al calce y al margen los que en ella intervinieron.';
    const cierreLines = doc.splitTextToSize(cierre, pw);
    y = this.drawJustified(doc, cierreLines, lm, y, pw, lh, fs, dark);

    y += 20;

    // ── Firmas: grid 2×2 ──────────────────────────────────────────────────────
    // Fila 1: PATRÓN  |  EL TRABAJADOR
    // Fila 2: TESTIGO |  TESTIGO
    const col1X = lm + pw * 0.18;
    const col2X = lm + pw * 0.68;
    const lineHalfW = 30;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(dark[0], dark[1], dark[2]);
    doc.text('PATRÓN', col1X, y, { align: 'center' });
    doc.text('EL TRABAJADOR', col2X, y, { align: 'center' });
    y += 14;

    doc.setLineWidth(0.4);
    doc.setDrawColor(dark[0], dark[1], dark[2]);
    doc.line(col1X - lineHalfW, y, col1X + lineHalfW, y);
    doc.line(col2X - lineHalfW, y, col2X + lineHalfW, y);
    y += 20;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('TESTIGO', col1X, y, { align: 'center' });
    doc.text('TESTIGO', col2X, y, { align: 'center' });
    y += 14;

    doc.setLineWidth(0.4);
    doc.line(col1X - lineHalfW, y, col1X + lineHalfW, y);
    doc.line(col2X - lineHalfW, y, col2X + lineHalfW, y);
  }

  private drawJustified(
    doc: jsPDF,
    lines: string[],
    x: number, y: number,
    pw: number, lh: number,
    fs: number,
    dark: [number, number, number]
  ): number {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fs);
    doc.setTextColor(dark[0], dark[1], dark[2]);
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

  /**
   * Renders mixed bold/normal segments as a single justified paragraph.
   * Bold segments (nombre, puesto) are rendered in bold, rest in normal.
   */
  private drawMixedJustified(
    doc: jsPDF,
    segments: { text: string; bold: boolean }[],
    x: number, y: number,
    pw: number, lh: number,
    fs: number,
    dark: [number, number, number]
  ): number {
    // Build plain text and bold map
    let plain = '';
    const boldMap: boolean[] = [];
    for (const seg of segments) {
      for (let i = 0; i < seg.text.length; i++) {
        boldMap.push(seg.bold);
      }
      plain += seg.text;
    }

    // Word-wrap the plain text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fs);
    const lines = doc.splitTextToSize(plain, pw);

    let charCursor = 0;

    for (let li = 0; li < lines.length; li++) {
      const line: string = lines[li];
      const isLast = li === lines.length - 1;
      const words = line.trim().split(' ');

      // Advance charCursor past leading spaces
      while (charCursor < plain.length && plain[charCursor] === ' ' && !line.startsWith(' ')) {
        charCursor++;
      }

      // Measure each word with its actual font
      const wordMeta: { w: string; bold: boolean; width: number }[] = [];
      let tmpCursor = charCursor;
      for (const word of words) {
        while (tmpCursor < plain.length && plain[tmpCursor] === ' ') tmpCursor++;
        const isBold = tmpCursor < boldMap.length && boldMap[tmpCursor];
        doc.setFont('helvetica', isBold ? 'bold' : 'normal');
        doc.setFontSize(fs);
        wordMeta.push({ w: word, bold: isBold, width: doc.getTextWidth(word) });
        tmpCursor += word.length;
      }

      let spaceW: number;
      if (isLast || wordMeta.length <= 1) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(fs);
        spaceW = doc.getTextWidth(' ');
      } else {
        const totalWordsW = wordMeta.reduce((s, m) => s + m.width, 0);
        spaceW = (pw - totalWordsW) / (wordMeta.length - 1);
      }

      let cx = x;
      let renderCursor = charCursor;
      for (const wm of wordMeta) {
        while (renderCursor < plain.length && plain[renderCursor] === ' ') renderCursor++;
        doc.setFont('helvetica', wm.bold ? 'bold' : 'normal');
        doc.setFontSize(fs);
        doc.setTextColor(dark[0], dark[1], dark[2]);
        doc.text(wm.w, cx, y);
        cx += wm.width + spaceW;
        renderCursor += wm.w.length;
      }

      charCursor += line.length + (li < lines.length - 1 ? 1 : 0);
      y += lh;
    }

    return y;
  }
}
