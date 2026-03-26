import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';

export interface CartaPatronalData {
  ciudad: string;
  estado: string;
  dia: string;
  mes: string;
  anio: string;
  nombreEmpleado: string;
  puesto: string;
  area: string;
  diasLaborales: string;
  horarioInicio: string;
  horarioFin: string;
  ingresoMensual: string;
  nss: string;
  diaAltaNss: string;
  mesAltaNss: string;
  anioAltaNss: string;
  diasVacaciones: string;
  nombreFirmante: string;
  cargoFirmante: string;
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
    const lm = 25;           // margen izquierdo
    const rm = 185;          // margen derecho (210 - 25)
    const pw = rm - lm;      // ancho de texto = 160
    const fs = 10;
    const lh = 6.5;
    const pageH = 297;

    // ── Logo (izquierda, mismo tamaño que imagen) ─────────────────────────────
    if (logoBase64) {
      doc.addImage(logoBase64, 'PNG', lm, 12, 18, 18);
    }

    // ── Fecha ────────────────────────────────────────────────────────────────
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fs);
    doc.setTextColor(20, 20, 20);
    const fecha = `${data.ciudad}, ${data.estado || ''} A ${data.dia} de ${data.mes} de ${data.anio}`;
    doc.text(fecha, rm, 55, { align: 'right' });

    let y = 72;

    // ── A QUIEN CORRESPONDA ───────────────────────────────────────────────────
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(fs);
    doc.text('A QUIEN CORRESPONDA:', lm, y);
    y += 12;

    // ── Párrafo principal ─────────────────────────────────────────────────────
    y = this.drawMixedJustified(doc, [
      { text: 'Por este medio, hacemos constar que el C. ', bold: false },
      { text: data.nombreEmpleado, bold: true },
      { text: ', presta sus servicios en esta empresa como ', bold: false },
      { text: data.puesto, bold: true },
      { text: ' dentro del área ', bold: false },
      { text: data.area, bold: true },
      { text: `, con un horario laboral de ${data.diasLaborales} de ${data.horarioInicio} a ${data.horarioFin}hrs, descansando los días Domingos y festivos. Su ingreso mensual es de `, bold: false },
      { text: `$${data.ingresoMensual}`, bold: true },
      { text: `. Su alta en el seguro social se generó con el número de afiliación `, bold: false },
      { text: data.nss, bold: true },
      { text: ` desde el día ${data.diaAltaNss} de ${data.mesAltaNss} de ${data.anioAltaNss}, Su proporción a vacaciones de acuerdo a su fecha de ingreso es de `, bold: false },
      { text: `${data.diasVacaciones} días.`, bold: true },
    ], lm, y, pw, lh, fs);
    y += lh * 1.5;

    // ── Párrafo 2 ─────────────────────────────────────────────────────────────
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fs);
    doc.setTextColor(20, 20, 20);
    const p2Lines = doc.splitTextToSize(
      'Se extiende la presente a petición del interesado para los fines legales que a él convengan.',
      pw
    );
    y = this.drawJustified(doc, p2Lines, lm, y, pw, lh);
    y += lh * 1.5;

    // ── Párrafo 3 ─────────────────────────────────────────────────────────────
    const p3Lines = doc.splitTextToSize(
      'Sin más por el momento me despido quedando a sus órdenes para cualquier duda o aclaración.',
      pw
    );
    y = this.drawJustified(doc, p3Lines, lm, y, pw, lh);
    y += lh * 4;

    // ── AFECTUOSAMENTE ────────────────────────────────────────────────────────
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fs);
    doc.setTextColor(20, 20, 20);
    doc.text('AFECTUOSAMENTE,', 105, y, { align: 'center' });
    y += lh * 4;

    // ── Línea de firma ────────────────────────────────────────────────────────
    doc.setDrawColor(80, 80, 80);
    doc.setLineWidth(0.3);
    doc.line(70, y, 140, y);
    y += lh;

    // ── Datos del firmante ────────────────────────────────────────────────────
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fs);
    doc.setTextColor(20, 20, 20);
    doc.text(data.nombreFirmante || 'Lic. María Asunción Mares Magallanes', 105, y, { align: 'center' });
    y += lh;
    doc.text(data.cargoFirmante || 'Coordinadora de Capital Humano', 105, y, { align: 'center' });

    // ── Pie de página (posición fija cerca del borde inferior) ────────────────
    const footerY = pageH - 28;
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.3);
    doc.line(lm, footerY, rm, footerY);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(fs + 1);
    doc.setTextColor(20, 20, 20);
    doc.text('INTEC DE JALISCO SA DE CV', 105, footerY + 7, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fs - 1);
    doc.setTextColor(0, 102, 204);
    doc.text('DOM. Misioneros #2138, Col. Jardines del Country, Guadalajara, Jalisco', 105, footerY + 13, { align: 'center' });
    doc.text('Tel: 33-36402647', 105, footerY + 19, { align: 'center' });
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
