import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';

export interface EntrevistaSalidaData {
  nombreColaborador: string;
  puesto: string;
  fechaIngreso: string;
  areaDepto: string;
  jefeInmediato: string;
  telefono: string;
  fechaSalida: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReportEntrevistaSalidaService {

  async generate(data: EntrevistaSalidaData): Promise<void> {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const logoBase64 = await this.loadLogoBase64();

    this.drawPage1(doc, data, logoBase64);
    doc.addPage();
    this.drawPage2(doc, logoBase64);

    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    doc.save(`EntrevistaDeSalida_${today}.pdf`);
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

  private drawHeader(doc: jsPDF, logoBase64: string | null): void {
    const lm = 15;
    const pw = 180;

    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.4);
    doc.rect(lm - 3, 8, pw + 6, 276);

    if (logoBase64) {
      doc.addImage(logoBase64, 'PNG', lm, 12, 18, 18);
    } else {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(42, 122, 228);
      doc.text('INTEC', lm + 5, 22);
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(30, 30, 30);
    doc.text('ENTREVISTA DE SALIDA', 105, 22, { align: 'center' });

  }

  private drawLine(doc: jsPDF, x1: number, y1: number, x2: number, y2?: number): void {
    doc.setDrawColor(80, 80, 80);
    doc.setLineWidth(0.25);
    doc.line(x1, y1, x2, y2 ?? y1);
  }

  private drawPage1(doc: jsPDF, data: EntrevistaSalidaData, logoBase64: string | null): void {
    const lm = 15;
    const pw = 180;

    this.drawHeader(doc, logoBase64);

    let y = 38;

    // ---- Campos de datos del colaborador ----
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(20, 20, 20);

    // Fila 1: Nombre del colaborador | Puesto
    doc.text('Nombre del colaborador', lm, y);
    doc.text(data.nombreColaborador, lm + 42, y);
    this.drawLine(doc, lm + 42, y + 0.5, lm + 97, y + 0.5);

    doc.text('Puesto', lm + 100, y);
    doc.text(data.puesto, lm + 111, y);
    this.drawLine(doc, lm + 111, y + 0.5, lm + pw, y + 0.5);

    y += 6;

    // Fila 2: Área o Depto. | Jefe Inmediato | Fecha de ingreso
    doc.text('Área o Depto.', lm, y);
    doc.text(data.areaDepto, lm + 23, y);
    this.drawLine(doc, lm + 23, y + 0.5, lm + 60, y + 0.5);

    doc.text('Jefe Inmediato', lm + 63, y);
    doc.text(data.jefeInmediato, lm + 89, y);
    this.drawLine(doc, lm + 89, y + 0.5, lm + 128, y + 0.5);

    doc.text('Fecha de ingreso', lm + 131, y);
    doc.text(data.fechaIngreso, lm + 157, y);
    this.drawLine(doc, lm + 157, y + 0.5, lm + pw, y + 0.5);

    y += 6;

    // Fila 3: #Telefónico | Fecha de salida
    doc.text('#Telefónico', lm, y);
    doc.text(data.telefono, lm + 20, y);
    this.drawLine(doc, lm + 20, y + 0.5, lm + 66, y + 0.5);

    doc.text('Fecha de salida', lm + 69, y);
    doc.text(data.fechaSalida, lm + 99, y);
    this.drawLine(doc, lm + 99, y + 0.5, lm + 155, y + 0.5);

    y += 9;

    // ---- Pregunta 1 ----
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(20, 20, 20);
    doc.text('1.', lm, y);
    doc.text('¿Por cuál de las razones decides retirarte de la Empresa?', lm + 6, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(20, 20, 20);

    const leftReasons = [
      'Baja Remuneración',
      'Falta de reconocimiento a su labor',
      'Incumplimiento de lo ofrecido al ingresar',
      'Falta de oportunidad de desarrollo profesional',
      'Horario de trabajo',
      'Otro empleo',
    ];
    const rightReasons = [
      'Problemas personales y/o familiares',
      'Demasiada presión y/o estrés',
      'Problemas con el encargado de obra',
      'Problemas con compañeros',
      'Falta de integración en el grupo',
      'Distancia de casa al lugar de trabajo',
      'Salud',
    ];

    const colMid = lm + pw / 2;
    const rowH = 5.5;

    for (let i = 0; i < Math.max(leftReasons.length, rightReasons.length); i++) {
      const ry = y + i * rowH;
      if (i < leftReasons.length) {
        doc.text(leftReasons[i] + '  (     )', lm, ry + 2.5);
      }
      if (i < rightReasons.length) {
        doc.text(rightReasons[i] + '  (     )', colMid, ry + 2.5);
      }
    }
    y += Math.max(leftReasons.length, rightReasons.length) * rowH + 5;

    // "De las alternativas..."
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(20, 20, 20);
    doc.text('De las alternativas marcadas, especifica tus razones:', lm, y);
    doc.setDrawColor(20, 20, 20);
    doc.setLineWidth(0.4);
    doc.line(lm, y + 1, lm + pw, y + 1);
    y += 6;
    doc.setDrawColor(100, 100, 100);
    doc.setLineWidth(0.25);
    doc.line(lm, y, lm + pw, y);
    y += 5;
    doc.line(lm, y, lm + pw, y);
    y += 5;
    doc.line(lm, y, lm + pw, y);
    y += 7;

    // "A que empresa te vas"
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(20, 20, 20);
    doc.text('A que empresa te vas', lm, y + 2.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text('(Indique el Rubro de su nueva organización)', lm + 37, y + 2.5);
    this.drawLine(doc, lm + 88, y + 2.5, lm + pw, y + 2.5);
    y += 8;

    // Pregunta 2
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(20, 20, 20);
    doc.text('2.', lm, y);
    doc.text('¿Cuánto tiempo llevas pensando en dejar la empresa?', lm + 6, y);
    y += 5;
    this.drawLine(doc, lm, y, lm + pw, y);
    y += 8;

    // Pregunta 3 — tabla
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(20, 20, 20);
    doc.text('3.', lm, y);
    doc.text('¿Califica los siguientes aspectos en la empresa?', lm + 6, y);
    y += 4;

    const q3Headers = ['MUY BUENO', 'BUENO', 'REGULAR', 'MALO', 'MUY MALO'];
    const q3Rows = [
      'Clima laboral',
      'Inducción y acompañamiento',
      'Capacitación y adiestramiento',
      'Integración al grupo de trabajo',
      'Reconocimiento',
      'Sueldo y prestaciones',
      'Trato por parte del encargado de obra',
      'Trato con los compañeros',
      'Instalaciones y/o condiciones ambientales',
      'Equipo de protección personal',
      'Uniforme',
    ];
    const labelW = 52;
    const numColW = (pw - labelW) / q3Headers.length;
    const hdrH = 5;
    const rowHt = 5.5;

    // Header
    doc.setFillColor(220, 220, 220);
    doc.setDrawColor(160, 160, 160);
    doc.setLineWidth(0.25);
    doc.rect(lm + labelW, y, pw - labelW, hdrH, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(20, 20, 20);
    for (let i = 0; i < q3Headers.length; i++) {
      const cx = lm + labelW + i * numColW + numColW / 2;
      doc.text(q3Headers[i], cx, y + hdrH / 2 + 1, { align: 'center' });
      if (i > 0) {
        doc.setDrawColor(160, 160, 160);
        doc.line(lm + labelW + i * numColW, y, lm + labelW + i * numColW, y + hdrH);
      }
    }

    // Rows
    for (let r = 0; r < q3Rows.length; r++) {
      const ry = y + hdrH + r * rowHt;
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.2);
      doc.rect(lm, ry, pw, rowHt);
      doc.setDrawColor(200, 200, 200);
      doc.line(lm + labelW, ry, lm + labelW, ry + rowHt);
      for (let i = 1; i < q3Headers.length; i++) {
        doc.line(lm + labelW + i * numColW, ry, lm + labelW + i * numColW, ry + rowHt);
      }
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(20, 20, 20);
      doc.text(`${r + 1}.  ${q3Rows[r]}`, lm + 1.5, ry + rowHt / 2 + 1);
    }

    y += hdrH + q3Rows.length * rowHt + 6;

    // Pregunta 4 — tabla SI/NO
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(20, 20, 20);
    doc.text('4.', lm, y);
    doc.text('¿La propuesta de trabajo coincidía con las condiciones reales?', lm + 6, y);
    y += 4;

    const q4Rows = ['1.-Carga de Trabajo', '2.-Horarios', '3.-Ambiente Laboral', '4.-Sueldo', '5.-Prestaciones'];
    const q4LabelW = 44;
    const q4ColW = 30;
    const q4TotalW = q4LabelW + q4ColW * 2;
    const q4HdrH = 5;
    const q4RowH = 5.5;

    doc.setFillColor(220, 220, 220);
    doc.setDrawColor(160, 160, 160);
    doc.setLineWidth(0.25);
    doc.rect(lm, y, q4TotalW, q4HdrH, 'FD');
    doc.line(lm + q4LabelW, y, lm + q4LabelW, y + q4HdrH);
    doc.line(lm + q4LabelW + q4ColW, y, lm + q4LabelW + q4ColW, y + q4HdrH);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(20, 20, 20);
    doc.text('SI', lm + q4LabelW + q4ColW / 2, y + q4HdrH / 2 + 1, { align: 'center' });
    doc.text('NO', lm + q4LabelW + q4ColW + q4ColW / 2, y + q4HdrH / 2 + 1, { align: 'center' });

    for (let r = 0; r < q4Rows.length; r++) {
      const ry = y + q4HdrH + r * q4RowH;
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.2);
      doc.rect(lm, ry, q4TotalW, q4RowH);
      doc.line(lm + q4LabelW, ry, lm + q4LabelW, ry + q4RowH);
      doc.line(lm + q4LabelW + q4ColW, ry, lm + q4LabelW + q4ColW, ry + q4RowH);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(20, 20, 20);
      doc.text(q4Rows[r], lm + 2, ry + q4RowH / 2 + 1);
    }
  }

  private drawPage2(doc: jsPDF, logoBase64: string | null): void {
    const lm = 15;
    const pw = 180;

    this.drawHeader(doc, logoBase64);

    let y = 40;
    const lineGap = 7;

    // Q5
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(20, 20, 20);
    doc.text('5.', lm, y);
    doc.text('¿Las responsabilidades y labores de tu puesto correspondían a lo que esperabas?', lm + 6, y);
    doc.text('SI ( )  NO ( )', lm + pw - 20, y);
    y += 5;
    doc.text('¿Por qué?', lm, y);
    y += 4;
    this.drawLine(doc, lm, y, lm + pw, y); y += lineGap;
    this.drawLine(doc, lm, y, lm + pw, y); y += lineGap + 4;

    // Q6
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(20, 20, 20);
    doc.text('6.', lm, y);
    doc.text('¿Qué era lo que ', lm + 6, y);
    doc.setFont('helvetica', 'bolditalic');
    const masX = lm + 6 + doc.getTextWidth('¿Qué era lo que ');
    doc.text('más', masX, y);
    doc.setFont('helvetica', 'bold');
    const masEnd = masX + doc.getTextWidth('más');
    doc.text(' te gustaba de tus Labores?', masEnd, y);
    y += 4;
    this.drawLine(doc, lm, y, lm + pw, y); y += lineGap + 4;

    // Q7
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(20, 20, 20);
    doc.text('7.', lm, y);
    doc.text('¿Qué era lo que ', lm + 6, y);
    doc.setFont('helvetica', 'bolditalic');
    const menosX = lm + 6 + doc.getTextWidth('¿Qué era lo que ');
    doc.text('menos', menosX, y);
    doc.setFont('helvetica', 'bold');
    const menosEnd = menosX + doc.getTextWidth('menos');
    doc.text(' te gustaba de tus Labores?', menosEnd, y);
    y += 4;
    this.drawLine(doc, lm, y, lm + pw, y); y += lineGap + 4;

    // Q8
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(20, 20, 20);
    doc.text('8.', lm, y);
    doc.text('Si estuviera en tus manos ¿Qué hubieras hecho para impedir tu salida de la empresa?', lm + 6, y);
    y += 4;
    this.drawLine(doc, lm, y, lm + pw, y); y += lineGap;
    this.drawLine(doc, lm, y, lm + pw, y); y += lineGap + 4;

    // Q9
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(20, 20, 20);
    doc.text('9.', lm, y);
    doc.text('¿Tienes alguna sugerencia para mejorar las condiciones laborales?', lm + 6, y);
    y += 4;
    this.drawLine(doc, lm, y, lm + pw, y); y += lineGap;
    this.drawLine(doc, lm, y, lm + pw, y); y += lineGap + 4;

    // Q10
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(20, 20, 20);
    doc.text('10.', lm, y);
    doc.text('¿Recomendarías la empresa para trabajar?', lm + 9, y);
    doc.text('SI ( )  NO ( )', lm + 105, y);
    y += 5;
    doc.text('¿Por qué?', lm, y);
    y += 4;
    this.drawLine(doc, lm, y, lm + pw, y); y += lineGap;
    this.drawLine(doc, lm, y, lm + pw, y); y += lineGap + 20;

    // Firmas
    const sigW = 65;
    const x1 = lm + 10;
    const x2 = lm + pw - sigW - 10;

    doc.setDrawColor(60, 60, 60);
    doc.setLineWidth(0.4);
    doc.line(x1, y, x1 + sigW, y);
    doc.line(x2, y, x2 + sigW, y);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(20, 20, 20);
    doc.text('TRABAJADOR', x1 + sigW / 2, y + 5, { align: 'center' });
    doc.text('RECURSOS HUMANOS', x2 + sigW / 2, y + 5, { align: 'center' });
  }
}
