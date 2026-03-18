import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';

export interface CartaTerminacionContratoData {
  ciudad: string;
  dia: string;
  mes: string;
  nombreTrabajador: string;
  puesto: string;
  diaEfectivo: string;
  mesEfectivo: string;
  nombreFirmante: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReportCartaTerminacionContratoService {

  async generate(data: CartaTerminacionContratoData): Promise<void> {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const logoBase64 = await this.loadLogoBase64();

    this.drawDocument(doc, logoBase64, data);

    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    doc.save(`CartaTerminacionContrato_${today}.pdf`);
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

  private readonly LM = 20;
  private readonly PW = 170;

  private drawDocument(doc: jsPDF, logoBase64: string | null, data: CartaTerminacionContratoData): void {
    const lm = this.LM;
    const pw = this.PW;
    const fs = 10;
    const lh = 6;

    // ── Logo ─────────────────────────────────────────────────────────────────
    if (logoBase64) {
      doc.addImage(logoBase64, 'PNG', lm, 10, 22, 18);
    }

    let y = 46;

    // ── Fecha (alineada a la derecha) ─────────────────────────────────────────
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fs);
    doc.setTextColor(0, 0, 0);
    const ciudad = data.ciudad || '___________';
    const dia = data.dia || '__';
    const mes = data.mes || '___________';
    doc.text(`${ciudad}, Jalisco a ${dia} de ${mes} 2026`, lm + pw, y, { align: 'right' });
    y += 18;

    // ── Destinatario ──────────────────────────────────────────────────────────
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(fs);
    doc.text('Señor', lm, y);
    y += lh;

    doc.setFont('helvetica', 'bold');
    doc.text(data.nombreTrabajador || 'NOMBRE DEL TRABAJADOR', lm, y);
    y += lh;

    doc.setFont('helvetica', 'bold');
    doc.text(data.puesto || 'PUESTO', lm, y);
    y += lh;

    doc.setFont('helvetica', 'bold');
    doc.text('Intec de Jalisco S.A. de C.V.', lm, y);
    y += lh * 2.5;

    // ── Párrafo 1 ─────────────────────────────────────────────────────────────
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fs);
    const p1 = doc.splitTextToSize(
      'Me permito comunicarle que en virtud a que el término de vigencia pactado en el contrato individual de trabajo suscrito con usted está próximo a vencerse, esta empresa ha decidido no darlo por prorrogado. Por lo anterior, le comunico que la empresa ha decidido dar por terminado su contrato de trabajo, de conformidad con el 39-E de la Ley Federal del trabajo.',
      pw
    );
    y = this.drawJustified(doc, p1, lm, y, pw, lh, fs);
    y += lh * 0.5;

    // ── Párrafo 2 ─────────────────────────────────────────────────────────────
    const diaEf = data.diaEfectivo || '__';
    const mesEf = data.mesEfectivo || '___________';
    const p2text = `Dicha decisión será efectiva a partir del día ${diaEf} de ${mesEf} 2026. Por lo tanto, terminada la jornada podrá solicitar su liquidación de prestaciones de ley y salario adeudados conforme a lo enunciado en la Ley Federal del trabajo.`;
    const p2 = doc.splitTextToSize(p2text, pw);
    y = this.drawJustified(doc, p2, lm, y, pw, lh, fs);
    y += lh * 0.5;

    // ── Párrafo 3 ─────────────────────────────────────────────────────────────
    const p3 = doc.splitTextToSize(
      'Es oportuno manifestarle nuestro agradecimiento por su labor prestada en la empresa, por lo que nos vemos en la obligación de resaltar y aplaudir su desempeño.',
      pw
    );
    y = this.drawJustified(doc, p3, lm, y, pw, lh, fs);
    y += lh;

    // ── Cierre ────────────────────────────────────────────────────────────────
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fs);
    doc.text('Atentamente,', lm, y);
    y += lh;

    doc.setFont('helvetica', 'bold');
    doc.text(data.nombreFirmante || 'Ing. Juan Pablo Jimenez Espinoza.', lm, y);
  }

  private drawJustified(
    doc: jsPDF,
    lines: string[],
    x: number, y: number,
    pw: number, lh: number,
    fs: number
  ): number {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fs);
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
