import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';

export interface CartaPatronalData {
  ciudad: string;
  dia: string;
  mes: string;
  anio: string;
  nombreEmpleado: string;
  puesto: string;
  diaInicio: string;
  mesInicio: string;
  anioInicio: string;
  diaFin: string;
  mesFin: string;
  anioFin: string;
  nombreFirmante: string;
  cargoFirmante: string;
  celFirmante: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReportCartaPatronalService {

  async generate(data: CartaPatronalData): Promise<void> {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const logoBase64 = await this.loadLogoBase64();

    this.drawDocument(doc, data, logoBase64);

    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    doc.save(`CartaPatronal_${today}.pdf`);
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

  private drawDocument(doc: jsPDF, data: CartaPatronalData, logoBase64: string | null): void {
    const lm = 25;
    const pw = 160;
    const fs = 10;
    const lh = 6.5;

    // ── Logo ──────────────────────────────────────────────────────────────────
    if (logoBase64) {
      doc.addImage(logoBase64, 'PNG', lm, 15, 18, 18);
    }

    // ── Fecha ─────────────────────────────────────────────────────────────────
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fs);
    doc.setTextColor(20, 20, 20);
    const fecha = `${data.ciudad}, Jal. A ${data.dia} de ${data.mes} de ${data.anio}`;
    doc.text(fecha, lm + pw, 20, { align: 'right' });

    let y = 60;

    // ── A QUIEN CORRESPONDA ───────────────────────────────────────────────────
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(fs);
    doc.text('A QUIEN CORRESPONDA:', lm, y);
    y += 14;

    // ── Párrafo 1 con nombre y puesto en negritas ─────────────────────────────
    const seg1 = 'Por este medio, hacemos constar que el C. ';
    const seg2 = data.nombreEmpleado;
    const seg3 = ', prestó sus servicios en esta empresa como ';
    const seg4 = data.puesto;
    const seg5 = ` desde el día ${data.diaInicio} de ${data.mesInicio} de ${data.anioInicio} y hasta el día ${data.diaFin} de ${data.mesFin} de ${data.anioFin}.`;

    y = this.drawMixedJustified(doc, [
      { text: seg1, bold: false },
      { text: seg2, bold: true },
      { text: seg3, bold: false },
      { text: seg4, bold: true },
      { text: seg5, bold: false },
    ], lm, y, pw, lh, fs);
    y += lh;

    // ── Párrafo 2 ─────────────────────────────────────────────────────────────
    const p2Lines = doc.splitTextToSize(
      'Se extiende la presente a petición del interesado para los fines legales que a él convengan.',
      pw
    );
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fs);
    y = this.drawJustified(doc, p2Lines, lm, y, pw, lh);
    y += lh;

    // ── Párrafo 3 ─────────────────────────────────────────────────────────────
    const p3Lines = doc.splitTextToSize(
      'Sin más por el momento me despido quedando a sus órdenes para cualquier duda o aclaración.',
      pw
    );
    y = this.drawJustified(doc, p3Lines, lm, y, pw, lh);
    y += lh * 3;

    // ── AFECTUOSAMENTE ────────────────────────────────────────────────────────
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fs);
    doc.setTextColor(20, 20, 20);
    doc.text('AFECTUOSAMENTE,', 105, y, { align: 'center' });
    y += lh * 2;

    // ── Firmante ──────────────────────────────────────────────────────────────
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fs);
    doc.text(data.nombreFirmante || 'Lic. María Asunción Mares Magallanes', 105, y, { align: 'center' });
    y += lh;
    doc.text(data.cargoFirmante || 'Coordinador de R.H.', 105, y, { align: 'center' });
    y += lh;
    doc.text(`Cel. ${data.celFirmante}`, 105, y, { align: 'center' });
  }

  private drawJustified(doc: jsPDF, lines: string[], x: number, y: number, pw: number, lh: number): number {
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

  private drawMixedJustified(
    doc: jsPDF,
    segments: { text: string; bold: boolean }[],
    x: number, y: number,
    pw: number, lh: number, fs: number
  ): number {
    let plain = '';
    const boldMap: boolean[] = [];
    for (const seg of segments) {
      for (let i = 0; i < seg.text.length; i++) boldMap.push(seg.bold);
      plain += seg.text;
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fs);
    const lines = doc.splitTextToSize(plain, pw);

    let charCursor = 0;
    for (let li = 0; li < lines.length; li++) {
      const line: string = lines[li];
      const isLast = li === lines.length - 1;
      const words = line.trim().split(' ');

      while (charCursor < plain.length && plain[charCursor] === ' ' && !line.startsWith(' ')) charCursor++;

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
        const totalW = wordMeta.reduce((s, m) => s + m.width, 0);
        spaceW = (pw - totalW) / (wordMeta.length - 1);
      }

      let cx = x;
      let renderCursor = charCursor;
      for (const wm of wordMeta) {
        while (renderCursor < plain.length && plain[renderCursor] === ' ') renderCursor++;
        doc.setFont('helvetica', wm.bold ? 'bold' : 'normal');
        doc.setFontSize(fs);
        doc.setTextColor(20, 20, 20);
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
