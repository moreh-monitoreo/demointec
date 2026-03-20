import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';

export interface EncuestaSatisfaccionData {
  nombre: string;
  puesto: string;
  edad: string;
  estadoCivil: string;
  ubicacionObra: string;
  ingreso: string;
  domicilio: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReportEncuestaSatisfaccionService {

  async generate(data: EncuestaSatisfaccionData): Promise<void> {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const logoBase64 = await this.loadLogoBase64();

    this.drawPage(doc, data, logoBase64);

    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    doc.save(`EncuestaSatisfaccion_${today}.pdf`);
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

  private drawPage(doc: jsPDF, data: EncuestaSatisfaccionData, logoBase64: string | null): void {
    const lm = 15;
    const pw = 180;
    const orange: [number, number, number] = [245, 133, 37];

    // ---- Logo ----
    if (logoBase64) {
      doc.addImage(logoBase64, 'PNG', lm, 10, 18, 18);
    } else {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(42, 122, 228);
      doc.text('INTEC', lm + 5, 22);
    }

    // ---- Título ----
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(20, 20, 20);
    doc.text('ENCUESTA DE SATISFACCION Y CLIMA LABORAL', 105, 16, { align: 'center' });

    // ---- Subtítulo ----
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(60, 60, 60);
    const subtitle = 'Nuestro compromiso es generar un buen clima laboral, así como reconocer el trabajo de todos y para';
    const subtitle2 = 'lograrlo tu opinión es de máxima importancia.';
    doc.text(subtitle, 105, 22, { align: 'center' });
    doc.text(subtitle2, 105, 26, { align: 'center' });

    let y = 32;

    // ---- Tabla de datos del empleado ----
    const cellH = 8;
    const col1W = 50;
    const col2W = 35;
    const col3W = 35;
    const col4W = pw - col1W - col2W - col3W;

    // Fila 1: NOMBRE | PUESTO | EDAD | ESTADO CIVIL
    this.drawOrangeCell(doc, lm, y, col1W, cellH, 'NOMBRE:', data.nombre, orange);
    this.drawOrangeCell(doc, lm + col1W, y, col2W, cellH, 'PUESTO:', data.puesto, orange);
    this.drawOrangeCell(doc, lm + col1W + col2W, y, col3W, cellH, 'EDAD:', data.edad, orange);
    this.drawOrangeCell(doc, lm + col1W + col2W + col3W, y, col4W, cellH, 'ESTADO CIVIL:', data.estadoCivil, orange);
    y += cellH;

    // Fila 2: UBICACIÓN/OBRA | DOMICILIO | INGRESO
    const ubiW = 55;
    const domW = 90;
    const ingW = pw - ubiW - domW;
    this.drawOrangeCell(doc, lm, y, ubiW, cellH, 'UBICACIÓN/OBRA', data.ubicacionObra, orange);
    this.drawOrangeCell(doc, lm + ubiW, y, domW, cellH, 'DOMICILIO:', data.domicilio, orange);
    this.drawOrangeCell(doc, lm + ubiW + domW, y, ingW, cellH, 'INGRESO:', data.ingreso, orange);
    y += cellH + 4;

    // ---- Texto introductorio ----
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(40, 40, 40);
    const intro = 'Estamos en la búsqueda permanente de maneras de mejorar. Para hacerlo, necesitamos saber qué es lo que piensas. Te agradeceríamos mucho que dedicaras unos minutos a responder las pocas preguntas que siguen. La calificación que otorgues es la información más importante que podemos obtener. Por favor sé honesto con tus respuestas, esta información será tratada de manera confidencial.';
    const introLines = doc.splitTextToSize(intro, pw);
    doc.text(introLines, lm, y);
    y += introLines.length * 4 + 3;

    // ---- Instrucciones ----
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(20, 20, 20);
    doc.text('Instrucciones:', lm, y);
    doc.setFont('helvetica', 'normal');
    doc.text(' Marca con una X la respuesta que consideres del 1 al 5. Tomando 1 como "Muy Insatisfecho" o 5 como', lm + 21, y);
    y += 4.5;
    doc.text('"Muy Satisfecho". Al final debe quedar marcada solo una opción en cada pregunta.', lm, y);
    y += 6;

    // ---- Escala ----
    const scaleHeaders = ['1\nMuy\nInsatisfecho', '2\nAlgo\nInsatisfecho', '3\nIndiferente', '4\nAlgo\nSatisfecho', '5\nMuy\nSatisfecho'];
    const scaleLabels = ['1', '2', '3', '4', '5'];
    const scaleTexts = ['Muy\nInsatisfecho', 'Algo\nInsatisfecho', 'Indiferente', 'Algo\nSatisfecho', 'Muy\nSatisfecho'];

    // ---- Tabla de preguntas ----
    const questions = [
      '1. ¿Cómo te recibieron en tu primer día en la empresa? ¿Recuerdas su nombre?',
      '2. ¿Te dieron uniforme y/o herramienta de trabajo?',
      '3. ¿Cómo te recibió tu Jefe (encargado de obra) el primer día que llegaste con él?',
      '4. ¿Recibiste inducción, adiestramiento o capacitación, cuántos días?',
      '5. ¿Cómo te sientes respecto a tu trabajo, las tareas y actividades que realizas?',
      '6. ¿Sabes quién es tu jefe inmediato, cómo es el trato con él?',
      '7. La retroalimentación sobre tu trabajo por parte de tu jefe.',
      '8. El apoyo que recibes cuando necesitas ayuda para resolver algún problema.',
      '9. El trato con tus compañeros.',
      '10. El sueldo que recibes.',
      '11. Las prestaciones.',
      '12. La jornada de trabajo.',
      '13. ¿Recomendarías a un amigo trabajar en la empresa?',
    ];

    const qLabelW = 110;
    const scaleColW = (pw - qLabelW) / 5;
    const qHdrH = 10;
    const qRowH = 6;

    // Header de escala
    doc.setFillColor(245, 133, 37);
    doc.setDrawColor(220, 100, 10);
    doc.setLineWidth(0.3);
    doc.rect(lm, y, pw, qHdrH, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.setTextColor(255, 255, 255);

    for (let i = 0; i < 5; i++) {
      const cx = lm + qLabelW + i * scaleColW + scaleColW / 2;
      doc.text(scaleLabels[i], cx, y + 3.5, { align: 'center' });
      const tlines = doc.splitTextToSize(scaleTexts[i], scaleColW - 1);
      doc.text(tlines, cx, y + 6.5, { align: 'center' });
      if (i > 0) {
        doc.setDrawColor(220, 100, 10);
        doc.line(lm + qLabelW + i * scaleColW, y, lm + qLabelW + i * scaleColW, y + qHdrH);
      }
    }
    y += qHdrH;

    // Filas de preguntas
    for (let r = 0; r < questions.length; r++) {
      const ry = y + r * qRowH;
      const fillColor = r % 2 === 0 ? [255, 255, 255] : [255, 245, 235];
      doc.setFillColor(fillColor[0], fillColor[1], fillColor[2]);
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.2);
      doc.rect(lm, ry, pw, qRowH, 'FD');

      // línea separadora label/columnas
      doc.setDrawColor(200, 200, 200);
      doc.line(lm + qLabelW, ry, lm + qLabelW, ry + qRowH);

      // columnas de escala
      for (let i = 1; i < 5; i++) {
        doc.line(lm + qLabelW + i * scaleColW, ry, lm + qLabelW + i * scaleColW, ry + qRowH);
      }

      // texto de pregunta
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(20, 20, 20);
      const qLines = doc.splitTextToSize(questions[r], qLabelW - 2);
      doc.text(qLines, lm + 1.5, ry + qRowH / 2 + 1);
    }

    y += questions.length * qRowH + 8;

    // ---- Agradecimiento ----
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...orange);
    doc.text('INTEC Agradece tus respuestas y colaboración.', 105, y, { align: 'center' });
  }

  private drawOrangeCell(
    doc: jsPDF,
    x: number, y: number, w: number, h: number,
    label: string, value: string,
    orange: [number, number, number]
  ): void {
    doc.setFillColor(255, 230, 200);
    doc.setDrawColor(orange[0], orange[1], orange[2]);
    doc.setLineWidth(0.4);
    doc.rect(x, y, w, h, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(orange[0], orange[1], orange[2]);
    doc.text(label, x + 1.5, y + 3.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(20, 20, 20);
    const valLines = doc.splitTextToSize(value, w - 3);
    doc.text(valLines, x + 1.5, y + 6.5);
  }
}
