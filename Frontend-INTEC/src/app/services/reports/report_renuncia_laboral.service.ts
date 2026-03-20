import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';

export interface RenunciaLaboralData {
  ciudad: string;
  dia: string;
  mes: string;
  anio: string;
  nombreTrabajador: string;
  puesto: string;
  diaInicioLaboral: string;
  mesInicioLaboral: string;
  anioInicioLaboral: string;
  diaSeparacion: string;
  mesSeparacion: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReportRenunciaLaboralService {

  async generate(data: RenunciaLaboralData): Promise<void> {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const logoBase64 = await this.loadLogoBase64();

    this.drawDocument(doc, data, logoBase64);

    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    doc.save(`RenunciaLaboral_${today}.pdf`);
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

  private drawDocument(doc: jsPDF, data: RenunciaLaboralData, logoBase64: string | null): void {
    const lm = 25;
    const rm = 25;
    const pw = 210 - lm - rm;
    const blue: [number, number, number] = [42, 122, 228];
    const black: [number, number, number] = [20, 20, 20];

    // ---- Logo ----
    if (logoBase64) {
      doc.addImage(logoBase64, 'PNG', lm, 12, 18, 18);
    } else {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(...blue);
      doc.text('INTEC', lm + 5, 24);
    }

    // ---- Ciudad y fecha (alineado a la derecha) ----
    const fechaTexto = `${data.ciudad}, Jalisco a ${data.dia} de ${data.mes} de ${data.anio}.`;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...black);
    doc.text(fechaTexto, lm + pw, 20, { align: 'right' });

    let y = 48;

    // ---- Destinatario ----
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...black);
    doc.text('INTEC DE JALISCO SA DE CV', lm, y);
    y += 6;
    doc.text('Y/O JUAN PABLO JIMENEZ', lm, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    // "P r e s e n t e:" con espaciado
    doc.setFont('helvetica', 'bold');
    doc.text('P r e s e n t e:', lm, y);
    y += 16;

    // ---- Línea TRABAJADOR ----
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...black);
    doc.text('TRABAJADOR:', lm, y);

    doc.setFont('helvetica', 'normal');
    doc.text(data.nombreTrabajador.toUpperCase(), lm + 34, y);

    y += 14;

    // ---- Párrafo 1 ----
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...black);

    const lineH = 7;

    const p1Lines = doc.splitTextToSize(
      `Por medio de la presente me permito comunicar a ustedes mi renuncia al puesto que he venido desempeñando como ${data.puesto} desde ${data.diaInicioLaboral} de ${data.mesInicioLaboral} de ${data.anioInicioLaboral}, y del cual me separaré voluntariamente por así convenir a mis intereses, a partir del día ${data.diaSeparacion} de ${data.mesSeparacion} del año ${data.anio}, dando por terminado el contrato de trabajo que me ligaba a la misma.`,
      pw
    );
    y = this.drawJustified(doc, p1Lines, lm, y, pw, lineH);
    y += 10;

    // ---- Párrafo 2 ----
    const p2Lines = doc.splitTextToSize(
      'Asimismo, declaro que durante el tiempo que laboré para esta empresa no contraje enfermedad alguna, en el ejercicio o con motivo del trabajo que desempeñé.',
      pw
    );
    y = this.drawJustified(doc, p2Lines, lm, y, pw, lineH);
    y += 10;

    // ---- Párrafo 3 ----
    const p3Lines = doc.splitTextToSize(
      'Agradeciendo todas las atenciones de que fui objeto, quedo:',
      pw
    );
    y = this.drawJustified(doc, p3Lines, lm, y, pw, lineH);
    y += 12;

    // ---- ATENTAMENTE ----
    const sigCenterX = lm + pw / 2;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...black);
    doc.text('A T E N T A M E N T E', sigCenterX, y, { align: 'center' });
    y += 7;

    // Ciudad, Jalisco.
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`${data.ciudad}, Jalisco.`, sigCenterX, y, { align: 'center' });
    y += 18;

    // Línea de firma
    const sigW = 80;
    const sigX = sigCenterX - sigW / 2;
    doc.setDrawColor(80, 80, 80);
    doc.setLineWidth(0.4);
    doc.line(sigX, y, sigX + sigW, y);
    y += 5;

    // NOMBRE en negritas centrado
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...black);
    doc.text(data.nombreTrabajador.toUpperCase(), sigCenterX, y, { align: 'center' });
    y += 7;

    // __ DE _____ DE 2026
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`${data.dia} DE ${data.mes.toUpperCase()} DE ${data.anio}`, sigCenterX, y, { align: 'center' });
  }

  private drawJustified(doc: jsPDF, lines: string[], x: number, y: number, pw: number, lineH: number): number {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const isLastLine = i === lines.length - 1;

      if (isLastLine) {
        doc.text(line, x, y);
      } else {
        const words = line.trim().split(' ');
        if (words.length <= 1) {
          doc.text(line, x, y);
        } else {
          const lineWidth = doc.getTextWidth(line.trim());
          const totalSpaceWidth = pw - lineWidth + doc.getTextWidth(' ') * (words.length - 1);
          const spaceWidth = totalSpaceWidth / (words.length - 1);
          let cx = x;
          for (let w = 0; w < words.length; w++) {
            doc.text(words[w], cx, y);
            if (w < words.length - 1) {
              cx += doc.getTextWidth(words[w]) + spaceWidth;
            }
          }
        }
      }
      y += lineH;
    }
    return y;
  }
}
