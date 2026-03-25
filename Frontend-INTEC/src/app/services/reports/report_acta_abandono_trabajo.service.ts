import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';

export interface ActaAbandonoTrabajoData {
  ciudad: string;
  estado: string;
  horas: string;
  dia: string;
  mes: string;
  anio: string;
  domicilioEmpresa: string;
  nombre: string;
  puesto: string;
  testigo1: string;
  testigo2: string;
  nombreObra: string;
  domicilioObra: string;
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

    if (logoBase64) {
      doc.addImage(logoBase64, 'PNG', lm, 10, 18, 18);
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(dark[0], dark[1], dark[2]);
    doc.text('INTEC DE JALISCO S.A. DE C.V.', lm + 26, 24);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('ACTA DE ABANDONO DE TRABAJO', 105, 44, { align: 'center' });

    let y = 60;

    y = this.drawMixedJustified(doc, [
      { text: `En la Ciudad de ${data.ciudad || ''}, ${data.estado || ''}. Siendo las ${data.horas || ''} horas del día ${data.dia || ''} de ${data.mes || ''} del año ${data.anio || ''}. Reunidos en las oficinas de la fuente de trabajo denominada Intec de Jalisco S.A. de C.V. ubicadas en `, bold: false },
      { text: data.domicilioEmpresa || '', bold: false },
      { text: ', representada por el C. Juan Pablo Jiménez Espinosa en su carácter de representante legal y los C. ', bold: false },
      { text: data.testigo1 || '', bold: true },
      { text: ' y ', bold: false },
      { text: data.testigo2 || '', bold: true },
      { text: ' con el carácter de testigos y quienes son trabajadores de la misma fuente de trabajo, con el objeto de hacer constar lo siguiente: el representante de la fuente de trabajo manifiesta que el día de hoy el C. ', bold: false },
      { text: data.nombre || '', bold: true },
      { text: ' quien se desempeña como trabajador con la calidad de ', bold: false },
      { text: data.puesto || '', bold: true },
      { text: ' en la fuente de trabajo en la que se actúa. Se retiró de su lugar de trabajo obra ', bold: false },
      { text: data.nombreObra || '', bold: true },
      { text: ' ubicada en ', bold: false },
      { text: data.domicilioObra || '', bold: false },
      { text: ' sin previa autorización y sin aviso alguno a su jefe directo. Por su parte los testigos ', bold: false },
      { text: data.testigo1 || '', bold: true },
      { text: ' y ', bold: false },
      { text: data.testigo2 || '', bold: true },
      { text: ' quienes también son trabajadores de la misma fuente de trabajo, manifiestan uno en pos de otro, estar enterados de la situación después del abandono del trabajador.', bold: false },
    ], lm, y, pw, lh, fs, dark);

    y += 8;

    const cierre = 'No habiendo más asuntos que tratar, se da por concluida la presente acta, firmando al calce y al margen los que en ella intervinieron.';
    const cierreLines = doc.splitTextToSize(cierre, pw);
    y = this.drawJustified(doc, cierreLines, lm, y, pw, lh, fs, dark);

    y += 20;

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
    doc: jsPDF, lines: string[],
    x: number, y: number, pw: number, lh: number,
    fs: number, dark: [number, number, number]
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

  private drawMixedJustified(
    doc: jsPDF,
    segments: { text: string; bold: boolean }[],
    x: number, y: number, pw: number, lh: number,
    fs: number, dark: [number, number, number]
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
