import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';

export interface ContratoConfidencialidadData {
  nombreEmpleado: string;
  rfc: string;
  curp: string;
  calle: string;
  numero: string;
  ext: string;
  colonia: string;
  municipio: string;
  cp: string;
  puesto: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReportContratoConfidencialidadService {

  async generate(data: ContratoConfidencialidadData): Promise<void> {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const logoBase64 = await this.loadLogoBase64();

    this.drawDocument(doc, data, logoBase64);

    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    doc.save(`ContratoConfidencialidad_${today}.pdf`);
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

  private readonly PAGE_H = 297;
  private readonly PAGE_BOTTOM = 275;

  private checkPageBreak(doc: jsPDF, y: number, logoBase64: string | null, lm: number, pw: number): number {
    if (y > this.PAGE_BOTTOM) {
      doc.addPage();
      return 20;
    }
    return y;
  }

  private drawPageHeader(doc: jsPDF, logoBase64: string | null, lm: number, pw: number): void {
    if (logoBase64) {
      doc.addImage(logoBase64, 'PNG', lm, 8, 18, 18);
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(20, 20, 20);
    doc.text('CONTRATO DE CONFIDENCIALIDAD', 105, 15, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
  }

  private drawDocument(doc: jsPDF, data: ContratoConfidencialidadData, logoBase64: string | null): void {
    const lm = 20;
    const rm = 20;
    const pw = 210 - lm - rm;
    const lineH = 6;
    const fs = 10;

    // ---- Logo ----
    if (logoBase64) {
      doc.addImage(logoBase64, 'PNG', lm, 8, 18, 18);
    } else {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(42, 122, 228);
      doc.text('INTEC', lm + 4, 20);
    }

    // ---- Título ----
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(20, 20, 20);
    doc.text('CONTRATO DE CONFIDENCIALIDAD', 105, 15, { align: 'center' });

    let y = 34;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fs);
    doc.setTextColor(20, 20, 20);

    // ---- Preámbulo (parte fija de la empresa) ----
    const preIntro =
      'Contrato de confidencialidad que celebran por una parte INTEC DE JALISCO S.A. DE C.V., ' +
      'como propietaria de la fuente de trabajo ubicada en Misioneros No.2138, colonia Jardines del Country, ' +
      'Guadalajara, Jalisco, C.P. 44210, con R.F.C. IJA081210367, con actividad de construcción, proyección, ' +
      'dirección, planeación, cimentación, edificación, estructura, ejecución, instalación, reparación y ' +
      'administración de toda clase de obras de ingeniería en general, cableado, estructurado, fibra óptica y ' +
      'redes de comunicación en general, proporcionar o recibir toda clase de servicios profesionales, técnicos, ' +
      'administrativos o de supervisión, contratación y subcontratación para el cumplimiento de los fines ' +
      'mencionados. ';

    const preLines = doc.splitTextToSize(preIntro, pw);
    y = this.drawJustified(doc, preLines, lm, y, pw, lineH);

    // ---- Párrafo del empleado: texto completo como cadena plana para justificar ----
    // Segmentos: [texto, bold?]
    type Seg = { t: string; b: boolean };
    const nombreVal = data.nombreEmpleado.toUpperCase();
    const domicilio = `${data.calle} #${data.numero} – ${data.ext}`;
    const segments: Seg[] = [
      { t: '"LA EMPRESA O EL PATRON"', b: true },
      { t: '; y por otra parte el C. ', b: false },
      { t: nombreVal, b: true },
      { t: ', con RFC ', b: false },
      { t: data.rfc, b: false },
      { t: ', con CURP ', b: false },
      { t: data.curp, b: false },
      { t: ', con domicilio en ' + domicilio + ', de la colonia ', b: false },
      { t: data.colonia, b: true },
      { t: ', en el municipio de ', b: false },
      { t: data.municipio, b: true },
      { t: ', Jalisco, C.P. ', b: false },
      { t: data.cp, b: false },
      { t: ', con el puesto de ', b: false },
      { t: data.puesto, b: true },
      { t: '., a quien dentro del presente documento se le mencionará como ', b: false },
      { t: '"EL EMPLEADO"', b: true },
      { t: ', acuerdo de voluntades que sujetan al tenor de las siguientes:', b: false },
    ];

    y = this.drawSegments(doc, segments, lm, y, pw, lineH, fs);
    y += 4;

    // ---- CLAUSULAS ----
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(20, 20, 20);
    doc.text('CLAUSULAS:', 105, y, { align: 'center' });
    y += lineH + 2;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fs);

    const clausulas = [
      {
        num: 'PRIMERA.-',
        text: 'Acuerdo de confidencialidad, todas las personas que laboran para la empresa, se obligan y comprometen a cumplir los términos de la Ley de Propiedad Industrial, en el sentido de no revelar información de ningún tipo acerca del proyecto, en el que se está participando a ningún tercero no autorizado, so pena de las sanciones civiles, administrativas y penales que procedan en cada caso.'
      },
      {
        num: 'SEGUNDA.-',
        text: 'A toda persona le queda estrictamente prohibido divulgar información privilegiada de la empresa a terceras personas, así como a revelar secretos de instalación, de prestación de servicios, de distribución o ventas relacionadas con el funcionamiento y buen manejo de la empresa.'
      },
      {
        num: 'TERCERA.-',
        text: 'Toda persona que labora en la empresa, le queda prohibido comprometerse con terceros para efectuar, alguna otra actividad que se relacione con su trabajo, y entorpezca la realización adecuada de sus labores.'
      },
      {
        num: 'CUARTA.-',
        text: 'A toda persona que labora para esta empresa, le queda prohibido el manejo de archivos, documentos, logotipos, uniformes, dibujos, especificaciones, y otros conceptos relacionados con los secretos comerciales, o con el negocio de la empresa, o terceros, que sean preparados por el trabajador, que el mismo tenga conocimiento de ellos, o estén en posesión del trabajador, permanecerán bajo la única y exclusiva propiedad de la empresa, o terceros según el caso y bajo ninguna circunstancia podrán ser retirados de las instalaciones de la empresa, sin previo consentimiento y autorización directas y por escrito de INTEC DE JALISCO, S.A. DE C.V.'
      },
      {
        num: 'QUINTA.-',
        text: 'Todo el personal que labora para la empresa, deberá conducirse con la debida éticas y profesionalismo cumpliendo con cada instrucción que se le asigne y siempre deberá utilizar los uniformes o cualquier elemento que tenga que ver con la imagen de la empresa con total respeto y cuidando el adecuado manejo de los logotipos, marcas o razones comerciales que se encuentran adheridas a sus uniformes que serán utilizados en calidad de obligatorios.'
      },
      {
        num: 'SEXTA.-',
        text: 'A todo trabajador conviene en someterse a los reconocimientos médicos que periódicamente ordene el patrón, en los términos de la fracción X del artículo 134 de la Ley Federal del Trabajo, en el concepto de que el médico que los practique será designado y retribuido por el mismo patrón.'
      },
      {
        num: 'SÉPTIMA.-',
        text: 'Convienen las partes que el acuerdo de confidencialidad que se pacta en el presente contrato, en caso de violación a cualquiera de las cláusulas aquí estipuladas, dará motivo a la intervención de la autoridad judicial, sin que bastar con el acta que se levante en donde consten los hechos y razones de la violación cometida por el trabajador, procediendo en consecuencia a denunciar los hechos delictuosos cometidos en contra de la empresa, ante el ministerio público en turno, adscrito a la Fiscalía General del estado de Jalisco.'
      },
    ];

    for (const cl of clausulas) {
      y = this.checkPageBreak(doc, y, logoBase64, lm, pw);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(fs);
      doc.setTextColor(20, 20, 20);
      const numStr = cl.num + ' ';
      const numW = doc.getTextWidth(numStr);

      // Split the full clause text into lines using full page width
      doc.setFont('helvetica', 'normal');
      const allLines = doc.splitTextToSize(cl.text, pw - numW);
      // Re-split remaining lines at full page width
      const firstLine = allLines[0] ?? '';
      const remainingText = allLines.slice(1).join(' ');
      const restLines = remainingText.length > 0 ? doc.splitTextToSize(remainingText, pw) : [];

      // Draw bold number + first line (justified within its available width)
      doc.setFont('helvetica', 'bold');
      doc.text(numStr, lm, y);
      doc.setFont('helvetica', 'normal');
      // Justify the first line within (pw - numW) starting at lm + numW
      const firstLineWords = firstLine.trim().split(' ');
      if (firstLineWords.length > 1 && restLines.length > 0) {
        // Not the last line — justify it
        const firstLineW = pw - numW;
        const lw = doc.getTextWidth(firstLine.trim());
        const sp = (firstLineW - lw + doc.getTextWidth(' ') * (firstLineWords.length - 1)) / (firstLineWords.length - 1);
        let cx = lm + numW;
        for (const word of firstLineWords) {
          doc.text(word, cx, y);
          cx += doc.getTextWidth(word) + sp;
        }
      } else {
        doc.text(firstLine, lm + numW, y);
      }
      y += lineH;

      // Draw rest lines justified at full page width, with page break checks
      for (let i = 0; i < restLines.length; i++) {
        y = this.checkPageBreak(doc, y, logoBase64, lm, pw);
        const line = restLines[i];
        const isLast = i === restLines.length - 1;
        const words = line.trim().split(' ');
        if (isLast || words.length <= 1) {
          doc.text(line, lm, y);
        } else {
          const lw = doc.getTextWidth(line.trim());
          const sp = (pw - lw + doc.getTextWidth(' ') * (words.length - 1)) / (words.length - 1);
          let cx = lm;
          for (const word of words) {
            doc.text(word, cx, y);
            cx += doc.getTextWidth(word) + sp;
          }
        }
        y += lineH;
      }
      y += 3;
    }

    // ---- Firma ----
    y = this.checkPageBreak(doc, y + 8, logoBase64, lm, pw);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(20, 20, 20);
    doc.text('EL EMPLEADO', 105, y, { align: 'center' });
    y += 20;

    const sigW = 80;
    const sigX = 105 - sigW / 2;
    doc.setDrawColor(60, 60, 60);
    doc.setLineWidth(0.3);
    doc.line(sigX, y, sigX + sigW, y);
    y += 6;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(data.nombreEmpleado.toUpperCase(), 105, y, { align: 'center' });
  }

  // Renders mixed bold/normal segments as a justified paragraph.
  // Segments are merged into a single text stream, then word-wrapped and justified line by line.
  private drawSegments(
    doc: jsPDF,
    segments: { t: string; b: boolean }[],
    x: number, y: number, pw: number, lineH: number, fs: number
  ): number {
    // Build a flat token list: { word, bold }
    const tokens: { w: string; b: boolean }[] = [];
    for (const seg of segments) {
      const words = seg.t.split(/(\s+)/);
      for (const chunk of words) {
        if (chunk.trim().length > 0) {
          tokens.push({ w: chunk.trim(), b: seg.b });
        } else if (chunk.length > 0 && tokens.length > 0) {
          // space between tokens — attach to previous as trailing space marker
          tokens.push({ w: '', b: false });
        }
      }
    }

    // Measure each token width
    const widths: number[] = tokens.map(tok => {
      if (tok.w === '') return 0;
      doc.setFont('helvetica', tok.b ? 'bold' : 'normal');
      doc.setFontSize(fs);
      return doc.getTextWidth(tok.w);
    });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fs);
    const spaceW = doc.getTextWidth(' ');

    // Word-wrap into lines
    type LineToken = { w: string; b: boolean; width: number };
    const lines: LineToken[][] = [];
    let currentLine: LineToken[] = [];
    let currentW = 0;

    for (let i = 0; i < tokens.length; i++) {
      const tok = tokens[i];
      if (tok.w === '') continue; // skip space tokens
      const tw = widths[i];
      const addSpace = currentLine.length > 0 ? spaceW : 0;
      if (currentLine.length > 0 && currentW + addSpace + tw > pw + 0.01) {
        lines.push(currentLine);
        currentLine = [{ w: tok.w, b: tok.b, width: tw }];
        currentW = tw;
      } else {
        currentLine.push({ w: tok.w, b: tok.b, width: tw });
        currentW += addSpace + tw;
      }
    }
    if (currentLine.length > 0) lines.push(currentLine);

    // Draw each line
    for (let li = 0; li < lines.length; li++) {
      const line = lines[li];
      const isLast = li === lines.length - 1;
      const totalW = line.reduce((s, t) => s + t.width, 0) + spaceW * (line.length - 1);
      const gap = isLast || line.length <= 1 ? spaceW : (pw - totalW + spaceW * (line.length - 1)) / (line.length - 1);

      let cx = x;
      for (let ti = 0; ti < line.length; ti++) {
        const tok = line[ti];
        doc.setFont('helvetica', tok.b ? 'bold' : 'normal');
        doc.setFontSize(fs);
        doc.text(tok.w, cx, y);
        if (ti < line.length - 1) {
          cx += tok.width + gap;
        }
      }
      y += lineH;
    }
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fs);
    return y;
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
