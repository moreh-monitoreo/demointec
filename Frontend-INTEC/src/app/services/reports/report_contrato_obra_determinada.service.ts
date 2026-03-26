import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';

export interface ContratoObraDeterminadaData {
  // Encabezado
  nombreEmpleado: string;
  ciudad: string;
  estado: string;
  dia: string;
  mes: string;
  anio: string;
  // Segunda - datos personales
  sexo: string;
  edad: string;
  nacionalidad: string;
  claveElector: string;
  calle: string;
  numero: string;
  ext: string;
  colonia: string;
  cp: string;
  lugarNacimiento: string;
  diaNacimiento: string;
  mesNacimiento: string;
  anioNacimiento: string;
  nss: string;
  rfc: string;
  curp: string;
  puesto: string;
  // Tercera - horario
  horaInicioLV: string;
  horaFinLV: string;
  horaInicioSab: string;
  horaFinSab: string;
  // Quinta - salario
  salarioNum: string;
  salarioLetras: string;
  // Beneficiarios (hasta 3)
  benNombre1: string;
  benParentesco1: string;
  benPorcentaje1: string;
  benNombre2: string;
  benParentesco2: string;
  benPorcentaje2: string;
  benNombre3: string;
  benParentesco3: string;
  benPorcentaje3: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReportContratoObraDeterminadaService {

  async generate(data: ContratoObraDeterminadaData): Promise<void> {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    this.drawDocument(doc, data);

    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    doc.save(`ContratoObraDeterminada_${today}.pdf`);
  }

  // ─── constants ─────────────────────────────────────────────────────────────

  private readonly PAGE_BOTTOM = 272;

  // ─── helpers ───────────────────────────────────────────────────────────────

  private checkPageBreak(doc: jsPDF, y: number, lm: number): number {
    if (y > this.PAGE_BOTTOM) {
      doc.addPage();
      this.drawPageHeader(doc);
      return 28;
    }
    return y;
  }

  private drawPageHeader(doc: jsPDF): void {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(20, 20, 20);
    doc.text('CONTRATO INDIVIDUAL DE TRABAJO POR OBRA DETERMINADA', 105, 13, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
  }

  private drawDocument(doc: jsPDF, data: ContratoObraDeterminadaData): void {
    const lm = 18;
    const pw = 210 - lm - 18;
    const lh = 6;
    const fs = 10;

    this.drawPageHeader(doc);
    let y = 26;
    doc.setTextColor(20, 20, 20);

    // ── Encabezado del contrato ─────────────────────────────────────────────
    const introSegs = [
      { t: 'CONTRATO INDIVIDUAL DE TRABAJO POR OBRA DETERMINADA', b: true },
      { t: ', que se celebran por una parte la empresa ', b: false },
      { t: 'INTEC DE JALISCO SA DE CV.', b: true },
      { t: ', a quien en lo sucesivo se le denominara como ', b: false },
      { t: '"LA EMPRESA Y/O EL PATRON"', b: true },
      { t: ' y por la otra ', b: false },
      { t: data.nombreEmpleado.toUpperCase(), b: true },
      { t: ' por su propio derecho, a quien se le denominará ', b: false },
      { t: '"EL EMPLEADO Y/O EL TRABAJADOR"', b: true },
      { t: ', en la ciudad de ', b: false },
      { t: data.ciudad, b: true },
      { t: `, ${data.estado || ''} a `, b: false },
      { t: data.dia, b: true },
      { t: ' de ', b: false },
      { t: data.mes, b: true },
      { t: ' de ', b: false },
      { t: data.anio, b: true },
      { t: ' para los efectos del artículo 25 de la Ley Federal del Trabajo.', b: false },
    ];
    y = this.drawInlineSegs(doc, introSegs, lm, y, pw, lh, fs);
    y += 4;

    // Párrafo puente
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fs);
    const puente = 'En consideración a las declaraciones que anteceden, las partes convienen en las siguientes:';
    y = this.drawJustified(doc, doc.splitTextToSize(puente, pw), lm, y, pw, lh);
    y += 4;

    // ── PRIMERA ─────────────────────────────────────────────────────────────
    y = this.checkPageBreak(doc, y, lm);
    const p1segs = [
      { t: 'PRIMERA. ', b: true },
      { t: 'Declara ', b: false },
      { t: 'INTEC DE JALISCO SA DE CV.', b: true },
      { t: ', que es una sociedad constituida conforme a las leyes de la República Mexicana, con domicilio en ', b: false },
      { t: 'Misioneros #2138, Jardines del Country. C.P.44210 Guadalajara, Jal.', b: true },
    ];
    y = this.drawInlineSegs(doc, p1segs, lm, y, pw, lh, fs);
    y += 4;

    // ── SEGUNDA ─────────────────────────────────────────────────────────────
    y = this.checkPageBreak(doc, y, lm);
    const p2head = [
      { t: 'SEGUNDA. ', b: true },
      { t: 'Declara EL EMPLEADO:', b: false },
    ];
    y = this.drawInlineSegs(doc, p2head, lm, y, pw, lh, fs);
    y += 2;

    const pA1 = [
      { t: 'A) Ser de sexo ', b: false },
      { t: data.sexo, b: true },
      { t: ' de nombre ', b: false },
      { t: data.nombreEmpleado.toUpperCase(), b: true },
      { t: ' de ', b: false },
      { t: data.edad, b: true },
      { t: ' años de edad, de nacionalidad ', b: false },
      { t: data.nacionalidad, b: true },
      { t: ' quien se identifica con su credencial para votar expedida por el ', b: false },
      { t: 'INE', b: true },
      { t: ' con número de clave de elector ', b: false },
      { t: data.claveElector, b: true },
      { t: ', tener su domicilio particular en ', b: false },
      { t: data.calle, b: true },
      { t: ' # ', b: false },
      { t: data.numero, b: true },
      { t: ' – ', b: false },
      { t: data.ext, b: true },
      { t: ', ', b: false },
      { t: data.colonia, b: true },
      { t: ', ', b: false },
      { t: 'JALISCO. C.P.', b: true },
      { t: ' ', b: false },
      { t: data.cp, b: true },
    ];
    y = this.drawInlineSegsWithBreak(doc, pA1, lm, y, pw, lh, fs);

    const pA2 = [
      { t: 'Haber nacido en ', b: false },
      { t: data.lugarNacimiento, b: true },
      { t: ' el día ', b: false },
      { t: data.diaNacimiento, b: true },
      { t: ' del mes de ', b: false },
      { t: data.mesNacimiento, b: true },
      { t: ' del año ', b: false },
      { t: data.anioNacimiento, b: true },
      { t: ' con número de seguridad social ', b: false },
      { t: data.nss, b: true },
      { t: ' Registro Federal de Contribuyentes (RFC) ', b: false },
      { t: data.rfc, b: true },
      { t: ', y Clave Única de Registro de Población ', b: false },
      { t: data.curp, b: true },
      { t: '.', b: false },
    ];
    y = this.drawInlineSegsWithBreak(doc, pA2, lm, y, pw, lh, fs);
    y += 2;

    const pB = [
      { t: 'B) Que ha recibido una completa explicación de la naturaleza temporal del trabajo que va a desarrollar y que tiene los conocimientos y aptitudes necesarios para el desarrollo del puesto de "', b: false },
      { t: data.puesto, b: true },
      { t: '", por lo que está conforme en prestar los servicios mediante el contrato por ', b: false },
      { t: 'OBRA DETERMINADA', b: true },
      { t: ', subordinado exclusivamente al patrón en cuyo caso será el único responsable de los servicios prestados, realizando los trabajos con esmero y eficiencia de conformidad con lo establecido por el artículo 134 de la Ley Federal del Trabajo.', b: false },
    ];
    y = this.drawInlineSegsWithBreak(doc, pB, lm, y, pw, lh, fs);
    y += 4;

    // ── TERCERA ─────────────────────────────────────────────────────────────
    y = this.checkPageBreak(doc, y, lm);
    const p3 = [
      { t: 'TERCERA. ', b: true },
      { t: 'Las partes convienen en que ', b: false },
      { t: '"EL TRABAJADOR"', b: true },
      { t: ' prestará sus servicios al patrón con una jornada laboral de 8 horas diarias, en un horario de ', b: false },
      { t: data.horaInicioLV, b: true },
      { t: ' a ', b: false },
      { t: data.horaFinLV, b: true },
      { t: ' horas de Lunes a Viernes y de ', b: false },
      { t: data.horaInicioSab, b: true },
      { t: ' a ', b: false },
      { t: data.horaFinSab, b: true },
      { t: ' horas los sábados, descansando los domingos de cada semana; haciendo un total de 48 horas a la semana. Con fundamento en el artículo 59 de la Ley, las partes podrán fijar las modalidades que consideren convenientes con objeto de distribuir la jornada a que se refiere la presente cláusula. Estos horarios pueden cambiar dependiendo la necesidad de ', b: false },
      { t: '"EL PATRÓN"', b: true },
      { t: ', respetando siempre los máximos legales de la jornada. Consecuentemente el ', b: false },
      { t: '"TRABAJADOR"', b: true },
      { t: ' iniciará puntualmente sus labores en el sitio o lugar de trabajo que se le haya asignado.', b: false },
    ];
    y = this.drawInlineSegsWithBreak(doc, p3, lm, y, pw, lh, fs);
    y += 4;

    // ── CUARTA ──────────────────────────────────────────────────────────────
    y = this.checkPageBreak(doc, y, lm);
    const p4 = [
      { t: 'CUARTA. ', b: true },
      { t: '"EL TRABAJADOR"', b: true },
      { t: ' no podrá laborar más del tiempo señalado en la jornada legal, cuando por circunstancias extraordinarias se aumente la jornada de trabajo, los servicios prestados durante el tiempo excedente se considerarán como extraordinarios y se pagarán de conformidad con lo establecido en los artículos 66, 67 y 68 de la Ley Federal del Trabajo.', b: false },
    ];
    y = this.drawInlineSegsWithBreak(doc, p4, lm, y, pw, lh, fs);
    y += 4;

    // ── QUINTA ──────────────────────────────────────────────────────────────
    y = this.checkPageBreak(doc, y, lm);
    const p5a = [
      { t: 'QUINTA. ', b: true },
      { t: 'Como remuneración por sus servicios, el ', b: false },
      { t: '"TRABAJADOR"', b: true },
      { t: ' recibirá la cantidad de ', b: false },
      { t: `$${data.salarioNum}`, b: true },
      { t: ' (', b: false },
      { t: data.salarioLetras.toUpperCase(), b: true },
      { t: ' pesos 00/100 M.N.) de sueldo, cuyo pago será hecho por semanas vencidas, conviniendo las partes en que el salario mencionado en la presente cláusula incluye el importe de la parte proporcional del séptimo día y el pago de los días de descanso obligatorio. Ello conforme a lo dispuesto por los artículos 100 y 101 de la Ley Federal del Trabajo.', b: false },
    ];
    y = this.drawInlineSegsWithBreak(doc, p5a, lm, y, pw, lh, fs);
    y += 2;

    y = this.checkPageBreak(doc, y, lm);
    const p5b = [
      { t: 'Previo consentimiento ', b: false },
      { t: 'DEL TRABAJADOR', b: true },
      { t: ', el pago del salario podrá efectuarse por medio de depósito en cuenta bancaria, tarjeta de débito, transferencias o cualquier otro medio. Los gastos o costos que originen estos medios alternativos de pago serán cubiertos por el patrón, de acuerdo al artículo 101 de LFT.', b: false },
    ];
    y = this.drawInlineSegsWithBreak(doc, p5b, lm, y, pw, lh, fs);
    y += 2;

    y = this.checkPageBreak(doc, y, lm);
    const p5c = [
      { t: 'Por lo que el pago de la remuneración ', b: false },
      { t: 'AL TRABAJADOR', b: true },
      { t: ' será pagado ', b: false },
      { t: 'SEMANALMENTE', b: true },
      { t: ' y mediante ', b: false },
      { t: 'TRANSFERENCIA ELECTRÓNICA y/o EFECTIVO', b: true },
      { t: ' a la cuenta personal del trabajador que dará de alta para tal fin.', b: false },
    ];
    y = this.drawInlineSegsWithBreak(doc, p5c, lm, y, pw, lh, fs);
    y += 2;

    y = this.checkPageBreak(doc, y, lm);
    const p5d = [
      { t: 'Adicionalmente el patrón podrá otorgar a consideración de este al trabajador los siguientes estímulos: ', b: false },
      { t: 'Comisiones y compensaciones', b: true },
      { t: ', las políticas de estas serán determinadas por el patrón y las mismas serán otorgadas en base a la productividad y cumplimiento de metas que el patrón fije, las cuales si se llegaren a generar el patrón las liquidará, ambas partes acuerdan y reconocen en este acto que estos estímulos ', b: false },
      { t: 'no formarán parte por ningún motivo del salario', b: true },
      { t: ' ni podrán ser considerados como parte integral de este, así como tampoco el trabajador podrá reclamarlos y/o considerarlos una prestación salarial y por ende en este momento el trabajador manifiesta anticipadamente en que no se reserva derecho alguno para reclamar el pago de estos ya que reconoce que su otorgamiento es a criterio exclusivo ', b: false },
      { t: 'DEL PATRON', b: true },
      { t: '.', b: false },
    ];
    y = this.drawInlineSegsWithBreak(doc, p5d, lm, y, pw, lh, fs);
    y += 2;

    y = this.checkPageBreak(doc, y, lm);
    const p5e = [
      { t: 'Del salario del trabajador, ', b: false },
      { t: '"EL PATRÓN"', b: true },
      { t: ', hará las deducciones legales correspondientes, particularmente de las que se refiere a ', b: false },
      { t: 'Impuestos Sobre la Renta, Seguro Social', b: true },
      { t: ', etc. Así mismo, se harán las aportaciones y altas al ', b: false },
      { t: 'IMSS, INFONAVIT, AFORE y Hacienda', b: true },
      { t: ' en los términos de las legislaciones respectivas.', b: false },
    ];
    y = this.drawInlineSegsWithBreak(doc, p5e, lm, y, pw, lh, fs);
    y += 4;

    // ── SEXTA a DÉCIMA TERCERA (texto fijo) ─────────────────────────────────
    const clausulasFijas = [
      {
        num: 'SEXTA.',
        text: 'El "PATRÓN" se obliga a otorgar recibo por la totalidad de los salarios ordinarios y extraordinarios devengados a que tuviese derecho hasta la fecha del recibo correspondiente, por lo que, si el "TRABAJADOR" tuviese alguna aclaración que hacer sobre sus salarios en el momento de recibirlos, deberá hacerlo precisamente en ese momento, pues no se admitirá aclaración alguna una vez firmado el recibo respectivo.'
      },
      {
        num: 'SÉPTIMA.',
        text: 'El "TRABAJADOR" disfrutará de un día de descanso por cada seis de trabajo. En los casos en que el "PATRÓN" señale días de descanso que no coincidan con el día domingo, se obliga a pagar al "TRABAJADOR" la prima a que se refiere el artículo 71 de la Ley, durante el tiempo que el "TRABAJADOR" labore en día domingo. El "PATRÓN" se obliga a proporcionar al "TRABAJADOR" los días de descanso obligatorio que establece la Ley Federal del Trabajo y que coincidan con la duración del presente Contrato, de acuerdo a lo dispuesto por el artículo 74 de la Ley Federal del Trabajo. Cuando por necesidades del servicio, la empresa requiera que el empleado labore en un día de descanso obligatorio, el empleado tendrá derecho a que se le pague el salario en términos de lo dispuesto en los artículos 73 y 75 de la Ley Federal del Trabajo.'
      },
      {
        num: 'OCTAVA.',
        text: '"EL TRABAJADOR" tendrá derecho al pago de la parte proporcional de vacaciones al tiempo de servicios prestados, con una prima del 25% sobre los salarios correspondientes a la misma, teniendo en cuenta el término de la relación de trabajo, con arreglo a lo dispuesto en los artículos 76, 77 y 80 de la Ley Federal del Trabajo.'
      },
      {
        num: 'NOVENA.',
        text: '"EL TRABAJADOR" percibirá un aguinaldo anual, que deberá pagarse antes del veinte de diciembre, equivalente a 15 días de salario por lo menos y cuando no haya cumplido el año de servicios, tendrá derecho a que se le pague la parte proporcional al tiempo trabajado, de conformidad con lo dispuesto por el artículo 87 de la Ley Federal del Trabajo.'
      },
      {
        num: 'DÉCIMA.',
        text: '"EL TRABAJADOR" conviene en someterse a los reconocimientos médicos que periódicamente ordene el patrón en los términos de la fracción X del artículo 134 de la Ley Federal del Trabajo, en la inteligencia de que el médico que los practique será designado y retribuido por "EL PATRÓN".'
      },
      {
        num: 'DÉCIMA PRIMERA.',
        text: '"EL PATRÓN" inscribirá oportunamente al "TRABAJADOR" ante el Instituto Mexicano del Seguro Social, obligándose "EL TRABAJADOR" a permitir que "EL PATRÓN" le haga los descuentos a su salario que sean necesarios y que tengan por objeto cubrir la cuota obrera ante el Instituto Mexicano del Seguro Social. Ambas partes se comprometen a cumplir con todo lo relativo a la Ley del Seguro Social y sus Reglamentos.'
      },
      {
        num: 'DÉCIMA SEGUNDA.',
        text: 'Las partes convienen en que, al término de la obra objeto de este contrato, quedará terminada automáticamente la relación contractual, sin necesidad de aviso, ni de ningún otro requisito y cesarán todos sus efectos, de acuerdo con la fracción III del artículo 53 de la Ley Federal del Trabajo.'
      },
      {
        num: 'DÉCIMA TERCERA.',
        text: 'Ambas partes declaran que, respecto de las obligaciones y derechos que mutuamente corresponden y que no hayan sido motivo de cláusulas expresa en el presente contrato, se sujeta a las disposiciones de la Ley Federal del Trabajo. Leído que fue el presente contrato por las partes firman al margen en la primera y al calce para constancia y aceptación, ante la presencia de dos testigos, quedando un ejemplar en poder de cada una de ellas.'
      },
    ];

    for (const cl of clausulasFijas) {
      y = this.checkPageBreak(doc, y, lm);
      y = this.drawClause(doc, cl.num, cl.text, lm, y, pw, lh, fs);
      y += 3;
    }

    // ── DÉCIMA CUARTA - Beneficiarios ────────────────────────────────────────
    y = this.checkPageBreak(doc, y, lm);
    const d14text = 'El trabajador designa para el pago de salarios y prestaciones devengadas, dando cumplimiento con lo establecido en el artículo 25 fracción X a los siguientes beneficiarios y sus porcentajes:';
    y = this.drawClause(doc, 'DÉCIMA CUARTA.', d14text, lm, y, pw, lh, fs);
    y += 2;

    // Tabla beneficiarios
    y = this.checkPageBreak(doc, y, lm);
    const orange: [number, number, number] = [245, 133, 37];
    const colW = [90, 45, pw - 90 - 45];
    const hdrH = 6;
    const rowH = 7;

    const hdrs = ['NOMBRE', 'PARENTESCO', 'PORCENTAJE'];
    let cx = lm;
    for (let i = 0; i < 3; i++) {
      doc.setFillColor(orange[0], orange[1], orange[2]);
      doc.setDrawColor(200, 100, 0);
      doc.setLineWidth(0.3);
      doc.rect(cx, y, colW[i], hdrH, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(255, 255, 255);
      doc.text(hdrs[i], cx + colW[i] / 2, y + hdrH / 2 + 1.5, { align: 'center' });
      cx += colW[i];
    }
    y += hdrH;

    const bens = [
      [data.benNombre1, data.benParentesco1, data.benPorcentaje1],
      [data.benNombre2, data.benParentesco2, data.benPorcentaje2],
      [data.benNombre3, data.benParentesco3, data.benPorcentaje3],
    ];

    for (const row of bens) {
      cx = lm;
      for (let i = 0; i < 3; i++) {
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.2);
        doc.rect(cx, y, colW[i], rowH, 'FD');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(20, 20, 20);
        doc.text(row[i] ?? '', cx + 2, y + rowH / 2 + 1.5);
        cx += colW[i];
      }
      y += rowH;
    }

    y += 18;

    // ── Firmas ───────────────────────────────────────────────────────────────
    y = this.checkPageBreak(doc, y, lm);
    const sigW = 70;
    const leftSigX = lm + 10;
    const rightSigX = 210 - 18 - 10 - sigW;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(20, 20, 20);
    doc.text('TRABAJADOR', leftSigX + sigW / 2, y, { align: 'center' });
    doc.text('PATRÓN', rightSigX + sigW / 2, y, { align: 'center' });
    y += 14;
    doc.setDrawColor(60, 60, 60);
    doc.setLineWidth(0.3);
    doc.line(leftSigX, y, leftSigX + sigW, y);
    doc.line(rightSigX, y, rightSigX + sigW, y);
    y += 10;

    doc.text('TESTIGO', leftSigX + sigW / 2, y, { align: 'center' });
    doc.text('TESTIGO', rightSigX + sigW / 2, y, { align: 'center' });
    y += 14;
    doc.line(leftSigX, y, leftSigX + sigW, y);
    doc.line(rightSigX, y, rightSigX + sigW, y);
  }

  // ─── Clause renderer: bold number inline + justified text, with page breaks ─

  private drawClause(
    doc: jsPDF, num: string, text: string,
    lm: number, y: number, pw: number, lh: number, fs: number
  ): number {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(fs);
    doc.setTextColor(20, 20, 20);
    const numStr = num + ' ';
    const numW = doc.getTextWidth(numStr);

    doc.setFont('helvetica', 'normal');
    // Split full text at (pw - numW) to get first line, then re-wrap rest at pw
    const firstLineArr = doc.splitTextToSize(text, pw - numW);
    const firstLine = firstLineArr[0] ?? '';
    // Remaining words after first line
    const firstLineWords = firstLine.trim().split(/\s+/);
    const allWords = text.split(/\s+/);
    const remainingWords = allWords.slice(firstLineWords.length);
    const remainingText = remainingWords.join(' ');
    const restLines = remainingText.length > 0 ? doc.splitTextToSize(remainingText, pw) : [];

    // Draw bold number
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(fs);
    doc.text(numStr, lm, y);

    // Draw first line justified within (pw - numW)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fs);
    const firstLineW = pw - numW;
    const firstWords = firstLine.trim().split(' ');
    if (firstWords.length > 1 && restLines.length > 0) {
      const lw = doc.getTextWidth(firstLine.trim());
      const sp = (firstLineW - lw + doc.getTextWidth(' ') * (firstWords.length - 1)) / (firstWords.length - 1);
      let cx = lm + numW;
      for (const word of firstWords) {
        doc.text(word, cx, y);
        cx += doc.getTextWidth(word) + sp;
      }
    } else {
      doc.text(firstLine, lm + numW, y);
    }
    y += lh;

    // Draw rest lines justified at full pw, with page break checks
    for (let i = 0; i < restLines.length; i++) {
      y = this.checkPageBreak(doc, y, lm);
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
      y += lh;
    }
    return y;
  }

  // ─── Inline segments renderer (justified, with page breaks per line) ───────

  private drawInlineSegsWithBreak(
    doc: jsPDF,
    segs: { t: string; b: boolean }[],
    lm: number, y: number, pw: number, lh: number, fs: number
  ): number {
    const plain = segs.map(s => s.t).join('');
    const boldMap: boolean[] = [];
    for (const seg of segs) {
      for (let i = 0; i < seg.t.length; i++) boldMap.push(seg.b);
    }

    const lines: string[] = doc.splitTextToSize(plain, pw);
    let charCursor = 0;

    for (let li = 0; li < lines.length; li++) {
      y = this.checkPageBreak(doc, y, lm);
      const line = lines[li];
      const isLast = li === lines.length - 1;
      const words = line.trim().split(' ');

      // Determinar bold de cada palabra avanzando el cursor
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

      // Calcular spaceW midiendo el ancho real de la línea con fuentes correctas
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(fs);
      const naturalSpaceW = doc.getTextWidth(' ');
      let spaceW: number;
      if (isLast || words.length <= 1) {
        spaceW = naturalSpaceW;
      } else {
        const totalWordsW = wordMeta.reduce((s, m) => s + m.width, 0);
        spaceW = (pw - totalWordsW) / (words.length - 1);
      }

      let cx = lm;
      for (const meta of wordMeta) {
        while (charCursor < plain.length && plain[charCursor] === ' ') charCursor++;
        doc.setFont('helvetica', meta.bold ? 'bold' : 'normal');
        doc.setFontSize(fs);
        doc.setTextColor(20, 20, 20);
        doc.text(meta.w, cx, y);
        cx += meta.width + spaceW;
        charCursor += meta.w.length;
      }
      if (!isLast) charCursor += 1;
      y += lh;
    }
    return y;
  }

  private drawInlineSegs(
    doc: jsPDF,
    segs: { t: string; b: boolean }[],
    lm: number, y: number, pw: number, lh: number, fs: number
  ): number {
    return this.drawInlineSegsWithBreak(doc, segs, lm, y, pw, lh, fs);
  }

  private drawJustified(doc: jsPDF, lines: string[], x: number, y: number, pw: number, lineH: number): number {
    const fs = doc.getFontSize();
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const isLast = i === lines.length - 1;
      if (isLast || line.trim().split(' ').length <= 1) {
        doc.text(line, x, y);
      } else {
        const words = line.trim().split(' ');
        const lineW = doc.getTextWidth(line.trim());
        const sp = (pw - lineW + doc.getTextWidth(' ') * (words.length - 1)) / (words.length - 1);
        let cx = x;
        for (let wi = 0; wi < words.length; wi++) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(fs);
          doc.text(words[wi], cx, y);
          cx += doc.getTextWidth(words[wi]) + sp;
        }
      }
      y += lineH;
    }
    return y;
  }
}
