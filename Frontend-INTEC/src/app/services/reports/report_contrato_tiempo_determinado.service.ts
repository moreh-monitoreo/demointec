import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';

export interface ContratoTiempoDeterminadoData {
  ciudad: string;
  estado: string;
  dia: string;
  mes: string;
  anio: string;
  nombreEmpleado: string;
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
  diasPrueba: string;
  diaInicioContrato: string;
  mesInicioContrato: string;
  anioInicioContrato: string;
  diaFinContrato: string;
  mesFinContrato: string;
  anioFinContrato: string;
  horaInicioLV: string;
  horaFinLV: string;
  horaInicioSab: string;
  horaFinSab: string;
  salarioNum: string;
  salarioLetras: string;
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
export class ReportContratoTiempoDeterminadoService {

  async generate(data: ContratoTiempoDeterminadoData): Promise<void> {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    this.drawDocument(doc, data);
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    doc.save(`ContratoTiempoDeterminado_${today}.pdf`);
  }

  private readonly PAGE_BOTTOM = 272;

  private checkPageBreak(doc: jsPDF, y: number, lm: number): number {
    if (y > this.PAGE_BOTTOM) {
      doc.addPage();
      return 20;
    }
    return y;
  }

  private drawDocument(doc: jsPDF, data: ContratoTiempoDeterminadoData): void {
    const lm = 18;
    const pw = 210 - lm - 18;
    const lh = 6;
    const fs = 10;

    // ── Título página 1 ───────────────────────────────────────────────────────
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(20, 20, 20);
    doc.text('CONTRATO INDIVIDUAL DE TRABAJO', 105, 13, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fs);
    let y = 22;

    // ── Párrafo introductorio ─────────────────────────────────────────────────
    const introSegs = [
      { t: 'CONTRATO INDIVIDUAL DE TRABAJO POR TIEMPO DETERMINADO, SUJETO A PRUEBA', b: true },
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
      { t: ', mismos que se sujetan a las cláusulas que van precedidas de las siguientes declaraciones.', b: false },
    ];
    y = this.drawInlineSegs(doc, introSegs, lm, y, pw, lh, fs);
    y += 4;

    // ── I. Declara INTEC ──────────────────────────────────────────────────────
    y = this.checkPageBreak(doc, y, lm);
    const p1segs = [
      { t: 'I.- ', b: true },
      { t: 'Declara ', b: false },
      { t: 'INTEC DE JALISCO SA DE CV.', b: true },
      { t: ', que es una sociedad constituida conforme a las leyes de la República Mexicana, con domicilio en ', b: false },
      { t: 'Misioneros #2138, Jardines del Country. C.P.44210 Guadalajara, Jal.', b: true },
    ];
    y = this.drawInlineSegs(doc, p1segs, lm, y, pw, lh, fs);
    y += 4;

    // ── II. Declara EL EMPLEADO ───────────────────────────────────────────────
    y = this.checkPageBreak(doc, y, lm);
    y = this.drawInlineSegs(doc, [{ t: 'II.- ', b: true }, { t: 'Declara EL EMPLEADO:', b: false }], lm, y, pw, lh, fs);
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
      { t: data.ext ? ' – ' + data.ext : '', b: true },
      { t: ', ', b: false },
      { t: data.colonia, b: true },
      { t: ', JALISCO. C.P. ', b: true },
      { t: data.cp, b: true },
      { t: '.', b: false },
    ];
    y = this.drawInlineSegs(doc, pA1, lm, y, pw, lh, fs);

    const pA2 = [
      { t: 'B) Haber nacido en ', b: false },
      { t: data.lugarNacimiento, b: true },
      { t: ' el día ', b: false },
      { t: data.diaNacimiento, b: true },
      { t: ' del mes de ', b: false },
      { t: data.mesNacimiento, b: true },
      { t: ' del año ', b: false },
      { t: data.anioNacimiento, b: true },
      { t: ' con número de seguridad social ', b: false },
      { t: data.nss, b: true },
      { t: '- Registro Federal de Contribuyentes (RFC) ', b: false },
      { t: data.rfc, b: true },
      { t: ', y Clave Única de Registro de Población (CURP) ', b: false },
      { t: data.curp, b: true },
      { t: '.', b: false },
    ];
    y = this.drawInlineSegs(doc, pA2, lm, y, pw, lh, fs);
    y += 3;

    const pB = [
      { t: 'C) Que ha recibido una completa explicación de la naturaleza temporal del trabajo que va a desarrollar y que tiene los conocimientos y aptitudes necesarios para el desarrollo del puesto de "', b: false },
      { t: data.puesto, b: true },
      { t: '", por lo que está conforme en prestar los servicios mediante el contrato ', b: false },
      { t: 'A PRUEBA', b: true },
      { t: ', durante el término de ', b: false },
      { t: data.diasPrueba, b: true },
      { t: ' ', b: false },
      { t: 'DIAS NATURALES', b: true },
      { t: '. En consideración a las declaraciones que anteceden, las partes convienen en las siguientes:', b: false },
    ];
    y = this.drawInlineSegs(doc, pB, lm, y, pw, lh, fs);
    y += 5;

    // ── CLAUSULAS ─────────────────────────────────────────────────────────────
    y = this.checkPageBreak(doc, y, lm);
    doc.setFont('helvetica', 'bolditalic');
    doc.setFontSize(11);
    doc.text('CLAUSULAS', 105, y, { align: 'center' });
    y += 6;

    // ── PRIMERA ───────────────────────────────────────────────────────────────
    y = this.checkPageBreak(doc, y, lm);
    const p1c = [
      { t: 'PRIMERA.- ', b: true },
      { t: 'El presente contrato se celebra por ', b: false },
      { t: 'TIEMPO DETERMINADO, SUJETO A PRUEBA', b: true },
      { t: ' a partir de la firma del presente instrumento legal del ', b: false },
      { t: `${data.diaInicioContrato}/${data.mesInicioContrato}/${data.anioInicioContrato}`, b: true },
      { t: ' al ', b: false },
      { t: `${data.diaFinContrato}/${data.mesFinContrato}/${data.anioFinContrato}`, b: true },
      { t: ' fecha en la que el trabajador está de acuerdo y sabedor de que a partir de este momento comenzará a generar derechos a cargo de la fuente patronal, contrato individual de trabajo que solo podrá ser modificado, suspendido, rescindido o terminado en su plazo o en los casos y con los requisitos señalados en la Ley Federal del Trabajo. Las partes manifiestan que el contrato se celebra por el tiempo establecido en esta cláusula en el entendido de que se podrá dar por vencido anticipadamente sin responsabilidad para ', b: false },
      { t: 'LA EMPRESA Y EL PATRON', b: true },
      { t: ' en caso de que se cumpla con lo señalado en la cláusula que antecede, así mismo, las partes contratantes manifiestan en términos del art. 39 de la Ley Federal del Trabajo que si vencido el término fijado en la cláusula primera subsiste la materia de trabajo, la relación laboral se prorrogará única y exclusivamente por el tiempo que produce dicha circunstancia y consecuentemente terminada ésta, terminará también el contrato o relación laboral existente entre las partes contratantes', b: false },
    ];
    y = this.drawInlineSegs(doc, p1c, lm, y, pw, lh, fs);
    y += 3;

    y = this.checkPageBreak(doc, y, lm);
    const pTrabPrestara = [
      { t: '"EL TRABAJADOR"', b: true },
      { t: ' prestara sus servicios al ', b: false },
      { t: '"PATRON"', b: true },
      { t: ' en el entendido que esta cuenta con la capacidad, experiencia, aptitudes conocimientos y facultades necesarios para desempeñar el trabajo y puesto para el que es contratado.', b: false },
    ];
    y = this.drawInlineSegs(doc, pTrabPrestara, lm, y, pw, lh, fs);
    y += 3;

    // ── SEGUNDA ───────────────────────────────────────────────────────────────
    y = this.checkPageBreak(doc, y, lm);
    const p2c = [
      { t: 'SEGUNDA. - ', b: true },
      { t: '"EL EMPLEADO"', b: true },
      { t: ', conviene en prestar sus servicios personales subordinados a la ', b: false },
      { t: '"EMPRESA"', b: true },
      { t: ', con el puesto de "', b: false },
      { t: data.puesto, b: true },
      { t: '" sujetándose a la dirección, vigilancia o instrucción que reciba de la "EMPRESA" para el desempeño de sus labores, obligándose a atender todas las actividades relativas y conexas a su ocupación principal.', b: false },
    ];
    y = this.drawInlineSegs(doc, p2c, lm, y, pw, lh, fs);
    y += 3;

    // ── TERCERA – domicilio y traslados ───────────────────────────────────────
    y = this.checkPageBreak(doc, y, lm);
    const p3a = [
      { t: 'TERCERA. - EL EMPLEADO', b: true },
      { t: ', conviene en prestar sus servicios en el domicilio de la ', b: false },
      { t: 'EMPRESA', b: true },
      { t: ', ubicado en ', b: false },
      { t: 'Misioneros #2138, Jardines del Country. C.P.44210 Guadalajara, Jal.', b: true },
      { t: ' y/o donde determine EL PATRON, en cualquier parte de la República Mexicana en donde EL PATRON cuente con establecimientos u obras de su giro.', b: false },
    ];
    y = this.drawInlineSegs(doc, p3a, lm, y, pw, lh, fs);
    y += 3;

    y = this.checkPageBreak(doc, y, lm);
    const p3b = [
      { t: ' LA EMPRESA', b: true },
      { t: ', podrá de acuerdo a la naturaleza de la prestación de los servicios y con objeto de obtener una mayor productividad, eficacia y competitividad, cambiar al ', b: false },
      { t: 'EMPLEADO', b: true },
      { t: ' de área o centro de trabajo, para lo cual, este último otorga su consentimiento en este acto y se somete a las políticas de productividad que el patrón establezca en la fuente y/o fuentes de trabajo de su propiedad.', b: false },
    ];
    y = this.drawInlineSegs(doc, p3b, lm, y, pw, lh, fs);
    y += 3;

    y = this.checkPageBreak(doc, y, lm);
    const p3c = [
      { t: 'Para el caso de que por las necesidades del servicio, el ', b: false },
      { t: 'EMPLEADO', b: true },
      { t: ' deba ser trasladado a lugar DIVERSO DE SU DOMICILIO DENTRO de la República Mexicana, el ', b: false },
      { t: 'EMPLEADO', b: true },
      { t: ' manifiesta expresamente su conformidad con tal circunstancia para lo cual la EMPRESA, tendrá la obligación de rembolsar al ', b: false },
      { t: 'EMPLEADO', b: true },
      { t: ' los gastos de transportación que efectué, incluyéndose el transporte del maneje familiar, de igual forma se obliga a prestar y efectuar las actividades y funciones propias relativas y conexas del puesto para el cual fue contratado, en la plaza, ciudad o lugar que la ', b: false },
      { t: 'EMPRESA', b: true },
      { t: ' ordene, quedando el ', b: false },
      { t: 'EMPLEADO', b: true },
      { t: ' en el acuerdo y autorización de viajar cuando le sea solicitado.', b: false },
    ];
    y = this.drawInlineSegs(doc, p3c, lm, y, pw, lh, fs);
    y += 4;

    // ── JORNADA LABORAL subtítulo ─────────────────────────────────────────────
    y = this.checkPageBreak(doc, y, lm);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(fs);
    doc.text('JORNADA LABORAL', lm, y);
    y += lh;

    // ── CUARTA – Jornada ──────────────────────────────────────────────────────
    y = this.checkPageBreak(doc, y, lm);
    const p4c = [
      { t: 'CUARTA.- ', b: true },
      { t: 'Las partes acuerdan en que el ', b: false },
      { t: '"TRABAJADOR"', b: true },
      { t: ' prestará sus servicios en una jornada laboral de 8 horas diarias, en un horario de ', b: false },
      { t: data.horaInicioLV, b: true },
      { t: ' a ', b: false },
      { t: data.horaFinLV, b: true },
      { t: ' horas de ', b: false },
      { t: 'Lunes', b: true },
      { t: ' a ', b: false },
      { t: 'Viernes', b: true },
      { t: ' y de ', b: false },
      { t: data.horaInicioSab, b: true },
      { t: ' a ', b: false },
      { t: data.horaFinSab, b: true },
      { t: ' horas los días ', b: false },
      { t: 'Sábados', b: true },
      { t: ', descansando los ', b: false },
      { t: 'días Domingos', b: true },
      { t: ' de cada semana; haciendo un total de 48 horas a la semana. Con fundamento en el artículo 59 de la Ley, las partes podrán fijar las modalidades que consideren convenientes con objeto de distribuir la jornada a que se refiere la presente cláusula. Estos horarios pueden cambiar dependiendo la necesidad de ', b: false },
      { t: '"EL PATRÓN,"', b: true },
      { t: ' respetando siempre los máximos legales de la jornada. Consecuentemente el ', b: false },
      { t: '"TRABAJADOR"', b: true },
      { t: ' iniciará puntualmente sus labores en el sitio o lugar de trabajo que se le haya asignado.', b: false },
    ];
    y = this.drawInlineSegs(doc, p4c, lm, y, pw, lh, fs);
    y += 3;

    y = this.checkPageBreak(doc, y, lm);
    const p4extra = [
      { t: '"EL TRABAJADOR"', b: true },
      { t: ' no podrá laborar jornada de trabajo extraordinaria alguna sino es mediante autorización expresa por escrito y firmado por el ', b: false },
      { t: '"EL PATRÓN"', b: true },
      { t: ' y sin este requisito no le será reconocido ningún trabajo extraordinario y en consecuencia ', b: false },
      { t: '"EL PATRÓN"', b: true },
      { t: ' no tendrá obligación de pagar cantidad alguna por concepto de horas extras, de lo anterior EL TRABAJADOR en este acto manifiesta estar plenamente sabedor de tal instrucción y manifiesta su conformidad y obligación de respetar, por lo que en este acto de violentar esta política laboral de la empresa el trabajador de forma adelantada se desiste del derecho de reclamar al patrón por el pago de aquellas horas que trabaje por su propia cuenta y voluntad ya que como ha quedado asentado y acordado por ambas partes sin la autorización y/o petición expresa por parte de EL PATRON de que labore horas extras no serán reconocidas ni exigibles por el TRABAJADOR, materializando su aceptación con la firma al calce y al margen del presente instrumento legal como debida constancia.', b: false },
    ];
    y = this.drawInlineSegs(doc, p4extra, lm, y, pw, lh, fs);
    y += 4;

    // ── SALARIO Y PRESTACIONES subtítulo ─────────────────────────────────────
    y = this.checkPageBreak(doc, y, lm);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fs);
    doc.text('SALARIO Y PRESTACIONES', lm, y);
    y += lh;

    // ── QUINTA – Salario ──────────────────────────────────────────────────────
    y = this.checkPageBreak(doc, y, lm);
    const p5 = [
      { t: 'QUINTA.-', b: true },
      { t: '. Como remuneración por sus servicios, el ', b: false },
      { t: '"TRABAJADOR"', b: true },
      { t: ' recibirá la cantidad de ', b: false },
      { t: `$${data.salarioNum}`, b: true },
      { t: ' (', b: false },
      { t: data.salarioLetras.toUpperCase(), b: true },
      { t: ' pesos 00/100 M.N.) de sueldo, cuyo pago será hecho por semanas vencidas, conviniendo las partes en que el salario mencionado en la presente cláusula incluye el importe de la parte proporcional del séptimo día y el pago de los días de descanso obligatorio. Ello conforme a lo dispuesto por los artículos 100 y 101 de la Ley Federal del Trabajo.', b: false },
    ];
    y = this.drawInlineSegs(doc, p5, lm, y, pw, lh, fs);
    y += 3;

    y = this.checkPageBreak(doc, y, lm);
    const p5b = [
      { t: 'Previo consentimiento ', b: false },
      { t: 'DEL TRABAJADOR', b: true },
      { t: ', el pago del salario podrá efectuarse por medio de depósito en cuenta bancaria, tarjeta de débito, transferencias o cualquier otro medio. Los gastos o costos que originen estos medios alternativos de pago serán cubiertos por el patrón, de acuerdo al artículo 101 de LFT.', b: false },
    ];
    y = this.drawInlineSegs(doc, p5b, lm, y, pw, lh, fs);
    y += 3;

    y = this.checkPageBreak(doc, y, lm);
    const p5c = [
      { t: 'Por lo que el pago de la remuneración ', b: false },
      { t: 'AL TRABAJADOR', b: true },
      { t: ' será pagado ', b: false },
      { t: 'SEMANALMENTE', b: true },
      { t: ' y mediante ', b: false },
      { t: 'TRANSFERENCIA ELECTRONICA y/o EFECTVO', b: true },
      { t: ' a la cuenta personal del trabajador que dará de alta para tal fin.', b: false },
    ];
    y = this.drawInlineSegs(doc, p5c, lm, y, pw, lh, fs);
    y += 3;

    y = this.checkPageBreak(doc, y, lm);
    const p5d = [
      { t: 'Adicionalmente el patrón podrá otorgar a consideración de este al trabajador los siguientes estímulos: Comisiones y compensaciones, las políticas de estas serán determinadas por el patrón y las mismas serán otorgadas en base a la productividad y cumplimiento de metas que el patrón fije, las cuales si se llegaren a generar el patrón las liquidara, ambas partes acuerdan y reconocen en este acto que estos estímulos no formaran parte por ningún motivo del salario ni podrán ser considerados como parte integral de este, así como tampoco el trabajador podrá reclamarlos y/o considerarlos una prestación salarial y por ende en este momento el trabajador manifiesta anticipadamente en que no se reserva derecho alguno para reclamar el pago de estos ya que reconoce que su otorgamiento es a criterio exclusivo ', b: false },
      { t: 'DEL PATRON.', b: true },
    ];
    y = this.drawInlineSegs(doc, p5d, lm, y, pw, lh, fs);
    y += 3;

    y = this.checkPageBreak(doc, y, lm);
    const p5e = [
      { t: 'Del salario del trabajador, ', b: false },
      { t: '"EL PATRÓN"', b: true },
      { t: ', hará las deducciones legales correspondientes, particularmente de las que se refiere a ', b: false },
      { t: 'Impuestos Sobre la Renta, Seguro Social', b: true },
      { t: ', etc. Así mismo, se harán las aportaciones y altas al ', b: false },
      { t: 'IMSS, INFONAVIT, AFORE', b: true },
      { t: ' y Hacienda en los y términos de las legislaciones respectivas.', b: false },
    ];
    y = this.drawInlineSegs(doc, p5e, lm, y, pw, lh, fs);
    y += 3;

    // ── SEXTA ─────────────────────────────────────────────────────────────────
    y = this.checkPageBreak(doc, y, lm);
    y = this.drawClause(doc, 'SEXTA. -', 'El "PATRON" se obliga a otorgar recibo por la totalidad de los salarios ordinarios y extraordinarios devengados a que tuviese derecho hasta la fecha del recibo correspondiente, por lo que, si el "TRABAJADOR" tuviese alguna aclaración que hacer sobre sus salarios en el momento de recibirlos, deberá hacerlo precisamente en ese momento, pues no se admitirá aclaración alguna una vez firmado el recibo respectivo.', lm, y, pw, lh, fs);
    y += 3;

    // ── SÉPTIMA ───────────────────────────────────────────────────────────────
    y = this.checkPageBreak(doc, y, lm);
    y = this.drawClause(doc, 'SEPTIMA. -', 'El "TRABAJADOR" disfrutará de un día de descanso por cada seis de trabajo. En los casos en que el "PATRÓN" señale días de descanso que no coincidan con el día domingo, se obliga a pagar al "TRABAJADOR" la prima a que se refiere el artículo 71 de la Ley, durante el tiempo que el "TRABAJADOR" labore en día domingo.', lm, y, pw, lh, fs);
    y += 3;

    y = this.checkPageBreak(doc, y, lm);
    const p7b = [
      { t: 'El ', b: false },
      { t: '"PATRÓN"', b: true },
      { t: ' se obliga a proporcionar al ', b: false },
      { t: '"TRABAJADOR"', b: true },
      { t: ' los días de descanso obligatorio que establece la Ley Federal del Trabajo y que coincidan con la duración del presente Contrato, de acuerdo a lo dispuesto por el artículo 74 de la Ley Federal del Trabajo.', b: false },
    ];
    y = this.drawInlineSegs(doc, p7b, lm, y, pw, lh, fs);
    y += 3;

    y = this.checkPageBreak(doc, y, lm);
    const p7c = [
      { t: 'Cuando por necesidades del servicio, la empresa requiera que el empleado labore en un día de descanso obligatorio, el empleado tendrá derecho a que se le pague el salario en términos de lo dispuesto en los artículos 73 y 75 de la Ley Federal del Trabajo.', b: false },
    ];
    y = this.drawInlineSegs(doc, p7c, lm, y, pw, lh, fs);
    y += 3;

    // ── OCTAVA – IMSS ─────────────────────────────────────────────────────────
    y = this.checkPageBreak(doc, y, lm);
    const p8 = [
      { t: 'OCTAVA. -', b: true },
      { t: ' El ', b: false },
      { t: '"PATRÓN"', b: true },
      { t: ' inscribirá oportunamente al ', b: false },
      { t: '"TRABAJADOR"', b: true },
      { t: ' ante el Instituto Mexicano del Seguro Social, obligándose el ', b: false },
      { t: '"TRABAJADOR"', b: true },
      { t: ' a permitir que el ', b: false },
      { t: '"PATRÓN"', b: true },
      { t: ' le haga los descuentos a su salario que sean necesarios y que tengan por objeto cubrir la cuota obrera ante el Instituto Mexicano del Seguro Social. Ambas partes se comprometen a cumplir con todo lo relativo a la Ley del Seguro Social y sus Reglamentos.', b: false },
    ];
    y = this.drawInlineSegs(doc, p8, lm, y, pw, lh, fs);
    y += 3;

    // ── NOVENA – Vacaciones si indeterminado ──────────────────────────────────
    y = this.checkPageBreak(doc, y, lm);
    const p9 = [
      { t: 'NOVENA. -', b: true },
      { t: ' En caso de que el presente contrato posterior a su vencimiento se establezca por tiempo indeterminado El ', b: false },
      { t: 'EMPLEADO', b: true },
      { t: ', al cumplir un año de servicios, disfrutara de un periodo de vacaciones pagadas de doce días laborales y una prima vacacional del 25% del periodo que le corresponda. En la inteligencia de que el periodo relativo lo será concedido después de vencido el año de servicios y en la época en que determine la ', b: false },
      { t: 'EMPRESA', b: true },
      { t: ', obligándose el ', b: false },
      { t: 'EMPLEADO', b: true },
      { t: ' en todo caso, a solicitar sus vacaciones con una anticipación de un mes.', b: false },
    ];
    y = this.drawInlineSegs(doc, p9, lm, y, pw, lh, fs);
    y += 3;

    // ── DECIMA – Aguinaldo ────────────────────────────────────────────────────
    y = this.checkPageBreak(doc, y, lm);
    y = this.drawClause(doc, 'DECIMA. -', 'Anualmente o en fracción de este, el trabajador tendrá derecho al pago de 15 días de Aguinaldo o a la parte proporcional de éste por el tiempo prestado, de conformidad con lo que establece el artículo 87 de la Ley Federal del Trabajo.', lm, y, pw, lh, fs);
    y += 4;

    // ── CONFIDENCIALIDAD subtítulo ────────────────────────────────────────────
    y = this.checkPageBreak(doc, y, lm);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(fs);
    doc.text('CONFIDENCIALIDAD.', lm, y);
    y += lh;

    // ── DÉCIMA PRIMERA ────────────────────────────────────────────────────────
    y = this.checkPageBreak(doc, y, lm);
    y = this.drawClause(doc, 'DECIMA PRIMERA. -', 'Queda expresamente acordado entre las partes, que durante el desarrollo de las labores del "TRABAJADOR" éste se familiarizará, con cierta información del "PATRÓN," misma que se obliga a conservar, en forma estrictamente confidencial y, por tanto, se obliga a no divulgar a terceros, dicha información y a devolverla al "PATRÓN", al término de la vigencia de este contrato.', lm, y, pw, lh, fs);
    y += 3;

    // ── DÉCIMA SEGUNDA ────────────────────────────────────────────────────────
    y = this.checkPageBreak(doc, y, lm);
    const p12 = [
      { t: 'DECIMA SEGUNDA.-. ', b: true },
      { t: 'El ', b: false },
      { t: '"TRABAJADOR"', b: true },
      { t: ' reconoce que son propiedades del ', b: false },
      { t: '"PATRÓN"', b: true },
      { t: ' todos los documentos, materiales, manuales de instrucción e instrumentos en general que se le proporcionen para el mejor aprovechamiento de los conocimientos, que se le trasmitan desempeño de sus labores con motivo del presente contrato, obligándose a conservarlos en buen estado y a entregarlos al ', b: false },
      { t: '"PATRÓN"', b: true },
      { t: ' en el momento en el que éste los requiera, por lo cual dichos instrumentos, en ningún momento, podrán ser considerados como parte integrante del salario que devengue el ', b: false },
      { t: '"TRABAJADOR"', b: true },
      { t: '.', b: false },
    ];
    y = this.drawInlineSegs(doc, p12, lm, y, pw, lh, fs);
    y += 3;

    // ── DÉCIMA TERCERA ────────────────────────────────────────────────────────
    y = this.checkPageBreak(doc, y, lm);
    const p13 = [
      { t: 'DECIMA TERCERA.- ', b: true },
      { t: '"EL TRABAJADOR"', b: true },
      { t: ' se compromete a guardar y procurar la confiabilidad así como también se compromete a no sacar u obtener cualquier tipo de información de la fuente de trabajo con fines de lucro, es decir, que no deberá vender o realizar cualquier tipo de enajenación la información confidencial a persona ajena a la empresa, ya que la información que se maneja dentro de la empresa, deber de ser confidencial y de lo contrario se procederá a levantarle su respectiva acta administrativa y se le dará de baja definitiva de conformidad al artículo 47 fracción IX de la Ley Federal del Trabajo vigente.', b: false },
    ];
    y = this.drawInlineSegs(doc, p13, lm, y, pw, lh, fs);
    y += 3;

    y = this.checkPageBreak(doc, y, lm);
    const p13b = [
      { t: 'Dichas obligaciones y responsabilidades estarán vigentes durante y después de la conclusión del presente contrato hasta por un periodo de 5 años, tiempo en el cual no podrá prestar sus servicios con otro patrón del mismo giro.', b: false },
    ];
    y = this.drawInlineSegs(doc, p13b, lm, y, pw, lh, fs);
    y += 4;

    // ── Párrafo penalización ──────────────────────────────────────────────────
    y = this.checkPageBreak(doc, y, lm);
    const pPenal = [
      { t: 'Las partes acuerdan que la violación a las cláusulas DECIMA PRIMERA, DECIMA SEGUNDA, DECIMA TERCERA del presente contrato, se establece y el trabajador está de acuerdo en que se hará acreedor de una penalización equivalente a $5,000.00 dólares americanos al tipo de cambio que se tenga establecido por el Banco de México al momento de la violación de contrato.', b: false },
    ];
    y = this.drawInlineSegs(doc, pPenal, lm, y, pw, lh, fs);
    y += 4;

    // ── OBLIGACIONES subtítulo ────────────────────────────────────────────────
    y = this.checkPageBreak(doc, y, lm);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(fs);
    doc.text('OBLIGACIONES.', lm, y);
    y += lh;

    // ── DÉCIMA CUARTA ─────────────────────────────────────────────────────────
    y = this.checkPageBreak(doc, y, lm);
    y = this.drawClause(doc, 'DECIMA CUARTA. -', 'Para seguridad de los contratantes. "El EMPLEADO" estará obligado a someterse a exámenes médicos que acuerden la "EMPRESA" y poner en práctica las medidas profilácticas y de higiene que la misma o las autoridades del ramo acuerden.', lm, y, pw, lh, fs);
    y += 3;

    // ── DÉCIMA QUINTA ─────────────────────────────────────────────────────────
    y = this.checkPageBreak(doc, y, lm);
    const p15 = [
      { t: 'DECIMA QUINTA. -', b: true },
      { t: ' Los cambios de puesto y modificaciones de sueldo por promociones, serán consignados en los anexos del presente contrato que al efecto se formule, debiendo recibir el "EMPLEADO", la copia para que el original archive en el expediente personal y formar parte del mismo.', b: false },
    ];
    y = this.drawInlineSegs(doc, p15, lm, y, pw, lh, fs);
    y += 2;

    // ── Duplicado ciudad ──────────────────────────────────────────────────────
    y = this.checkPageBreak(doc, y, lm);
    const pDup = [
      { t: 'Duplicado en la ciudad de ', b: false },
      { t: data.ciudad, b: true },
      { t: ', ', b: false },
      { t: (data.estado || '').toUpperCase(), b: true },
      { t: ' el día ', b: false },
      { t: data.dia, b: true },
      { t: ' del mes de ', b: false },
      { t: data.mes, b: true },
      { t: ' del año ', b: false },
      { t: data.anio, b: true },
      { t: ', quedando un ejemplar en poder de cada una de las partes.', b: false },
    ];
    y = this.drawInlineSegs(doc, pDup, lm, y, pw, lh, fs);
    y += 4;

    // ── DÉCIMA SEXTA – Beneficiarios ──────────────────────────────────────────
    y = this.checkPageBreak(doc, y, lm);
    const d16segs = [
      { t: 'DECIMA SEXTA. ', b: true },
      { t: 'El trabajador designa para el pago de salarios y prestaciones devengadas, dando cumplimiento con lo establecido en el artículo 25 fracción X a los siguientes beneficiarios y sus porcentajes:', b: false },
    ];
    y = this.drawInlineSegs(doc, d16segs, lm, y, pw, lh, fs);
    y += 3;

    // Tabla beneficiarios
    y = this.checkPageBreak(doc, y, lm);
    const colW = [90, 45, pw - 90 - 45];
    const hdrH = 6;
    const rowH = 7;
    const hdrs = ['NOMBRE', 'PARENTESCO', 'PORCENTAJE'];
    let cx = lm;
    for (let i = 0; i < 3; i++) {
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(20, 20, 20);
      doc.setLineWidth(0.3);
      doc.rect(cx, y, colW[i], hdrH, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(20, 20, 20);
      doc.text(hdrs[i], cx + colW[i] / 2, y + hdrH / 2 + 1.5, { align: 'center' });
      cx += colW[i];
    }
    y += hdrH;

    const bens = [
      [data.benNombre1, data.benParentesco1, data.benPorcentaje1],
      [data.benNombre2, data.benParentesco2, data.benPorcentaje2],
      [data.benNombre3, data.benParentesco3, data.benPorcentaje3],
      ['', '', ''],
      ['', '', ''],
    ];

    for (const row of bens) {
      cx = lm;
      for (let i = 0; i < 3; i++) {
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(20, 20, 20);
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

    y += 16;

    // ── Firmas ────────────────────────────────────────────────────────────────
    y = this.checkPageBreak(doc, y, lm);
    const sigW = 70;
    const leftSigX = lm + 10;
    const rightSigX = 210 - 18 - 10 - sigW;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(20, 20, 20);
    doc.text('LA EMPRESA', leftSigX + sigW / 2, y, { align: 'center' });
    doc.text('El TRABAJADOR', rightSigX + sigW / 2, y, { align: 'center' });
    y += 14;
    doc.setDrawColor(60, 60, 60);
    doc.setLineWidth(0.3);
    doc.line(leftSigX, y, leftSigX + sigW, y);
    doc.line(rightSigX, y, rightSigX + sigW, y);
  }

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
    const firstLineArr = doc.splitTextToSize(text, pw - numW);
    const firstLine = firstLineArr[0] ?? '';
    const firstLineWords = firstLine.trim().split(/\s+/);
    const allWords = text.split(/\s+/);
    const remainingWords = allWords.slice(firstLineWords.length);
    const remainingText = remainingWords.join(' ');
    const restLines = remainingText.length > 0 ? doc.splitTextToSize(remainingText, pw) : [];

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(fs);
    doc.text(numStr, lm, y);

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

  private drawInlineSegs(
    doc: jsPDF,
    segs: { t: string; b: boolean }[],
    lm: number, y: number, pw: number, lh: number, fs: number
  ): number {
    const plain = segs.map(s => s.t).join('');
    const boldMap: boolean[] = [];
    for (const seg of segs) {
      for (let i = 0; i < seg.t.length; i++) boldMap.push(seg.b);
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fs);
    const lines: string[] = doc.splitTextToSize(plain, pw);
    let charCursor = 0;

    for (let li = 0; li < lines.length; li++) {
      y = this.checkPageBreak(doc, y, lm);
      const line = lines[li];
      const isLast = li === lines.length - 1;
      const words = line.trim().split(' ');

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

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(fs);
      let spaceW: number;
      if (isLast || words.length <= 1) {
        spaceW = doc.getTextWidth(' ');
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
}
