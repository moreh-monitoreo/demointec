import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';

export interface ContratoTiempoIndeterminadoData {
  ciudad: string;
  municipioComparecencia: string;
  estadoComparecencia: string;
  dia: string;
  mes: string;
  anio: string;
  nombreTrabajador: string;
  nacionalidad: string;
  calle: string;
  numero: string;
  colonia: string;
  cp: string;
  edad: string;
  sexo: string;
  estadoCivil: string;
  curp: string;
  rfc: string;
  nss: string;
  puesto: string;
  diaInicio: string;
  mesInicio: string;
  anioInicio: string;
  salarioNum: string;
  salarioLetras: string;
  benNombre1: string;
  benParentesco1: string;
  benNombreSust1: string;
  benParentescoSust1: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReportContratoTiempoIndeterminadoService {

  async generate(data: ContratoTiempoIndeterminadoData): Promise<void> {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    this.drawDocument(doc, data);
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    doc.save(`ContratoTiempoIndeterminado_${today}.pdf`);
  }

  private readonly PAGE_BOTTOM = 272;
  private readonly LM = 18;
  private readonly RM = 18;
  private readonly PW = 210 - 18 - 18;
  private readonly LH = 5.5;
  private readonly FS = 10;

  private checkPageBreak(doc: jsPDF, y: number): number {
    if (y > this.PAGE_BOTTOM) {
      doc.addPage();
      return 18;
    }
    return y;
  }

  private drawPageHeader(doc: jsPDF): void {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(20, 20, 20);
    doc.text('CONTRATO INDIVIDUAL DE TRABAJO POR TIEMPO INDETERMINADO', 105, 13, { align: 'center' });
  }

  private drawDocument(doc: jsPDF, data: ContratoTiempoIndeterminadoData): void {
    const lm    = this.LM;
    const pw    = this.PW;
    const lh    = this.LH;
    const fs    = this.FS;

    // Columnas para declaraciones
    const colRomano = lm;
    const colTitulo = lm + 16;
    const colNum    = lm + 16;
    const colBody   = lm + 24;
    const pwBody    = pw - (colBody - lm);
    const pwTitulo  = pw - (colTitulo - lm);

    this.drawPageHeader(doc);
    let y = 24;
    doc.setTextColor(20, 20, 20);

    // ── Comparecencia ───────────────────────────────────────────────────────
    y = this.drawInlineSegs(doc, [
      { t: `EN ${(data.municipioComparecencia + ' ' + data.estadoComparecencia).toUpperCase()} COMPARECEN POR UNA PARTE EL (LA) C. "`, b: false },
      { t: data.nombreTrabajador.toUpperCase(), b: false },
      { t: '", POR SU PROPIO DERECHO, A QUIEN EN LO SUCESIVO DENOMINADO COMO "EL (LA) TRABAJADOR(A)" Y POR OTRA PARTE LA PERSONA MORAL INTEC DE JALISCO SA DE CV A QUIEN EN LO SUCESIVO DENOMINAREMOS "EL PATRÓN" POR CONDUCTO DE SU REPRESENTANTE LEGAL "JUAN PABLO JIMÉNEZ ESPINOSA”, MISMO QUE SUJETAN AL TENOR DE LAS SIGUIENTES DECLARACIONES Y CLÁUSULAS', b: false },
    ], lm, y, pw, lh, fs);
    y += 5;

    // ── DECLARACIONES ──────────────────────────────────────────────────────
    y = this.checkPageBreak(doc, y);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(fs);
    doc.text('D E C L A R A C I O N E S:', 105, y, { align: 'center' });
    y += lh + 3;

    // I. DE EL PATRÓN
    y = this.checkPageBreak(doc, y);
    doc.setFont('helvetica', 'bold');
    doc.text('I.', colRomano, y);
    doc.text('DE EL PATRÓN:', colTitulo, y);
    doc.setFont('helvetica', 'normal');
    y += lh + 1;

    doc.setFont('helvetica', 'bold'); doc.text('1.', colNum, y); doc.setFont('helvetica', 'normal');
    y = this.drawInlineSegs(doc, [
      { t: 'Declara EL PATRÓN por conducto de su representante, que es una sociedad debidamente constituida de conformidad con las leyes mexicanas, según acreditada en este acto con el testimonio del instrumento público número ', b: false },
      { t: '20,459', b: true },
      { t: ' (', b: false }, { t: 'Veinte  mil cuatrocientos cincuenta y nueve', b: true }, { t: ') a cargo del Licenciado ', b: false },
      { t: 'Eduardo de Alba Góngora', b: true },
      { t: ', titular de la notaria pública N.', b: false }, { t: '38', b: true },
      { t: ' de la Ciudad de Zapopan, Jalisco otorgada el día ', b: false }, { t: '08 de diciembre de 2022', b: true }, { t: '.', b: false },
    ], colBody, y, pwBody, lh, fs);
    y += 2;

    doc.setFont('helvetica', 'bold'); doc.text('2.', colNum, y); doc.setFont('helvetica', 'normal');
    y = this.drawInlineSegs(doc, [
      { t: 'RFC: ', b: false }, { t: 'IJA081210367', b: true },
      { t: ', con domicilio en Calle Misioneros #2138, Jardines del Country. 44210. Guadalajara, Jalisco., "Dedicada a la construcción, proyección, dirección, planeación, cimentación, edificación, estructura, ejecución, instalación, reparación, y administración de toda clase de obras de ingeniería en general, cableado, estructurado, fibra óptica y redes de comunicación en general, proporcionar o recibir toda clase de servicios profesionales, técnicos, administrativos o de supervisión, contratación y subcontratación para el cumplimiento de los fines mencionados ".', b: false },
    ], colBody, y, pwBody, lh, fs);
    y += 2;
    y = this.checkPageBreak(doc, y);
    y = this.drawInlineSegs(doc, [
      { t: 'Por lo que necesita a una persona para llevar a cabo las actividades para las cuales es contratado EL(LA) TRABAJADOR(A).', b: false },
    ], colBody, y, pwBody, lh, fs);
    y += 2;

    doc.setFont('helvetica', 'bold'); doc.text('3.', colNum, y); doc.setFont('helvetica', 'normal');
    y = this.drawInlineSegs(doc, [
      { t: 'Continúa declarando EL PATRÓN, que las actividades antes citadas son de carácter indeterminado, a partir de la fecha ', b: false },
      { t: `${data.diaInicio}/${data.mesInicio}/${data.anioInicio}`, b: true },
      { t: ' por lo que requiere al trabajador para que las lleve las funciones a su cargo.', b: false },
    ], colBody, y, pwBody, lh, fs);
    y += 4;

    // II. DE EL(LA) TRABAJADOR(A)
    y = this.checkPageBreak(doc, y);
    doc.setFont('helvetica', 'bold');
    doc.text('II.', colRomano, y);
    doc.text('DE "EL(LA) TRABAJADOR(A)". Bajo protesta de decir verdad:', colTitulo, y);
    doc.setFont('helvetica', 'normal');
    y += lh + 1;

    doc.setFont('helvetica', 'bold'); doc.text('1.', colNum, y); doc.setFont('helvetica', 'normal');
    y = this.drawInlineSegs(doc, [
      { t: 'Que está consciente que se requieren sus servicios de manera indeterminada y que cuenta con los conocimientos, así como la capacitación y aptitudes para desempeñar el puesto que EL PATRÓN  requiere, por lo que está conforme en prestar sus servicios en forma indeterminada, expresando el más amplio consentimiento que en derecho proceda con la firma del presente contrato.', b: false },
    ], colBody, y, pwBody, lh, fs);
    y += 2;

    doc.setFont('helvetica', 'bold'); doc.text('2.', colNum, y); doc.setFont('helvetica', 'normal');
    y = this.drawInlineSegs(doc, [
      { t: 'Continúa declarando EL(LA) TRABAJADOR(A) tener los siguientes generales:', b: false },
    ], colBody, y, pwBody, lh, fs);
    y += 2;

    // Datos personales (números romanos)
    const indentRom = colBody + 4;
    const pwDato    = pw - (indentRom - lm);
    const personalItems = [
      { label: 'I.    Nombre:',                              value: `${data.nombreTrabajador.toUpperCase()} como ha quedado especificado al proemio de este contrato.` },
      { label: 'II.   Nacionalidad:',                        value: data.nacionalidad },
      { label: 'III.  Domicilio:',                           value: `${data.calle} # ${data.numero} - , ${data.colonia}. C.P. ${data.cp}.` },
      { label: 'IV.   De edad:',                             value: `${data.edad} años.` },
      { label: 'V.    Sexo:',                                value: `${data.sexo}.` },
      { label: 'VI.   Estado Civil:',                        value: `${data.estadoCivil}.` },
      { label: 'VII.  Clave Única de Registro de Población:', value: `${data.curp}.` },
      { label: 'VIII. RFC:',                                 value: `${data.rfc}.` },
      { label: 'IX.   Número de seguro social:',             value: `${data.nss}.` },
    ];
    for (const item of personalItems) {
      y = this.checkPageBreak(doc, y);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(fs);
      const labelW = doc.getTextWidth(item.label + ' ');
      doc.text(item.label, indentRom, y);
      doc.setFont('helvetica', 'normal');
      const valLines: string[] = doc.splitTextToSize(item.value, pwDato - labelW);
      doc.text(valLines[0], indentRom + labelW, y); y += lh;
      for (let i = 1; i < valLines.length; i++) { y = this.checkPageBreak(doc, y); doc.text(valLines[i], indentRom + labelW, y); y += lh; }
    }
    y += 2;

    y = this.checkPageBreak(doc, y);
    doc.setFont('helvetica', 'bold'); doc.text('3.', colNum, y); doc.setFont('helvetica', 'normal');
    y = this.drawInlineSegs(doc, [{ t: 'Que entiende que las necesidades específicas de la empresa y que dan origen a la materia de trabajo es por tiempo indeterminado.', b: false }], colBody, y, pwBody, lh, fs);
    y += 2;

    y = this.checkPageBreak(doc, y);
    doc.setFont('helvetica', 'bold'); doc.text('4.', colNum, y); doc.setFont('helvetica', 'normal');
    y = this.drawInlineSegs(doc, [{ t: 'No pertenecer actualmente a ninguna agrupación sindical, ni tener ningún otro empleo y/o ocupación que pudiere representar un conflicto de intereses con el PATRÓN o ir en detrimento de su productividad en las tareas que desarrolla.', b: false }], colBody, y, pwBody, lh, fs);
    y += 4;

    // III. AMBAS PARTES
    y = this.checkPageBreak(doc, y);
    doc.setFont('helvetica', 'bold');
    doc.text('III.', colRomano, y);
    doc.setFont('helvetica', 'normal');
    y = this.drawInlineSegs(doc, [{ t: 'AMBAS PARTES manifiestan que reconocen y entienden el alcance legal de la celebración del presente contrato y acuerdan sujetarse al tenor de las siguientes:', b: false }], colTitulo, y, pwTitulo, lh, fs);
    y += 6;

    // ── CLÁUSULAS ───────────────────────────────────────────────────────────
    y = this.checkPageBreak(doc, y);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('CLÁUSULAS:', 105, y, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fs);
    y += lh + 2;

    // PRIMERA
    y = this.checkPageBreak(doc, y);
    y = this.drawInlineSegs(doc, [
      { t: 'PRIMERA. -', b: true },
      { t: ' Este contrato se celebra por tiempo indeterminado, por lo que la relación de trabajo existente es de carácter permanente, aceptando EL (LA) TRABAJADOR(A) que mientras esté bajo el régimen de dicho contrato gozará de las prestaciones de ley. Por tal motivo, EL (LA) TRABAJADOR(A) se compromete a observar y cumplir todos los deberes y obligaciones derivadas de este contrato, de las leyes y de cualquier disposición aplicable.', b: false },
    ], lm, y, pw, lh, fs);
    y += 4;

    // SEGUNDA
    y = this.checkPageBreak(doc, y);
    y = this.drawInlineSegs(doc, [
      { t: 'SEGUNDA. -', b: true },
      { t: ' Este contrato se celebra con vigencia a partir del día ', b: false },
      { t: data.diaInicio, b: true }, { t: ' de ', b: false }, { t: data.mesInicio, b: true }, { t: ' de ', b: false }, { t: data.anioInicio, b: true },
      { t: '. Independientemente de que EL PATRÓN podrá rescindirlo en los casos y condiciones especificados en la Ley Federal del Trabajo y este contrato.', b: false },
    ], lm, y, pw, lh, fs);
    y += 4;

    // TERCERA
    y = this.checkPageBreak(doc, y);
    y = this.drawInlineSegs(doc, [
      { t: 'TERCERA. –', b: true },
      { t: ' EL (LA) TRABAJADOR(A) se obliga a prestar sus servicios personales subordinados al patrón en el puesto denominado ', b: false },
      { t: data.puesto, b: true },
      { t: '. y actividades complementarias para las que fue contratado(a).', b: false },
    ], lm, y, pw, lh, fs);
    y += 3;
    y = this.checkPageBreak(doc, y);
    y = this.drawInlineSegs(doc, [
      { t: 'EL (LA) TRABAJADOR(A) deberá prestar sus servicios al patrón con el mayor cuidado, esmero y lealtad posibles, ejecutando las labores propias del puesto para que se le contrata. Para mejor identificación de las labores y deberes del puesto de EL(LA) TRABAJADOR(A) y las actividades inherentes a su cargo, de manera enunciativa, pero no limitativa, se acuerda establecer por separado un ', b: false },
      { t: 'DESCRIPTIVO DE PUESTO', b: true },
      { t: ', así mismo, EL(LA) TRABAJADOR(A) se obliga a desempeñar cualquier otra actividad conexa o relacionada que le encomiende el PATRÓN, que sea compatible a sus conocimientos, capacidad o aptitudes, debiendo además acatar todas las disposiciones o instrucciones de carácter administrativo o de organización que EL PATRÓN llegue a dictar tanto de manera directa como a través sus gerentes, directivos, jefes, etc. a EL(LA) TRABAJADOR(A), como de carácter general a todo el personal, como anexo de este contrato. El local en el que prestará sus servicios EL (LA) TRABAJADOR(A), será el ubicado en ', b: false },
      { t: '"MISIONEROS #2138, JARDINES DEL COUNTRY. GUADALAJARA, JALISCO. C.P.44210"', b: true },
      { t: '; o en cualquier otro local presente o futuro en el que EL PATRÓN  tenga instaladas o llegue a instalar oficinas, sucursales o establecimientos, por lo que el lugar en que preste sus servicios podrá ser un domicilio diverso al señalado, pudiendo ser tanto en esta ciudad, como fuera de la misma. En el caso que EL PATRÓN por razones administrativas decida que EL (LA) TRABAJADOR(A) desempeñe sus labores en un lugar diverso al señalado en el párrafo anterior, deberá por escrito hacer del conocimiento de EL (LA) TRABAJADOR(A) tal decisión, y éste está conforme desde este momento en que deberá cumplirla como una orden de trabajo.', b: false },
    ], lm, y, pw, lh, fs);
    y += 3;
    y = this.checkPageBreak(doc, y);
    y = this.drawInlineSegs(doc, [{ t: 'EL(LA) TRABAJADOR(A) tiene la obligación de atender cualquier otro trabajo conexo con su obligación principal que le sea encomendada por EL PATRÓN, aun cuando accidentalmente dicha actividad sea desempeñada fuera de su lugar de trabajo, siempre que no corra peligro su integridad y no se violen las leyes aplicables ni las buenas costumbres.', b: false }], lm, y, pw, lh, fs);
    y += 3;
    y = this.checkPageBreak(doc, y);
    y = this.drawInlineSegs(doc, [{ t: 'EL(LA) TRABAJADOR(A) acatará las órdenes de trabajo que le den su jefe inmediato o cualquier representante del patrón, observando en todo momento las disposiciones de las Normas Oficiales Mexicanas, normas de trabajo que le son aplicables derivadas de la Ley Federal del Trabajo, del Reglamento Interior de Trabajo y cualquier otra disposición laboral interna de carácter obligatoria.', b: false }], lm, y, pw, lh, fs);
    y += 3;
    y = this.checkPageBreak(doc, y);
    y = this.drawInlineSegs(doc, [{ t: 'EL PATRÓN por razones económicas-administrativas puede solicitar cambiar de un lugar a otro de trabajo a EL (LA) TRABAJADOR(A) así como de realizar modificaciones en el puesto cubierto por EL (LA) TRABAJADOR(A) y sus actividades siempre que éstas sean compatibles con sus conocimientos y sin perjuicio de su salario, quedando en este acto asentado que EL(LA) TRABAJADOR(A) manifiesta su conformidad con lo anterior.', b: false }], lm, y, pw, lh, fs);
    y += 4;

    // CUARTA – Salario
    y = this.checkPageBreak(doc, y);
    y = this.drawInlineSegs(doc, [
      { t: 'CUARTA. -', b: true },
      { t: ` El salario de EL(LA) TRABAJADOR(A) será la cantidad de $${data.salarioNum}, (`, b: false },
      { t: data.salarioLetras.toUpperCase(), b: true }, { t: ' PESOS 00/100 M.N.)', b: true },
      { t: ' y se acuerda que se pague el salario en forma SEMANAL EL(LA) TRABAJADOR(A) está conforme en que, si el pago es realizado semanalmente, deberá ser pagado a más tardar los días Sábados de cada semana, y que para el caso en que este pago de forma QUINCENAL este será pagado los días quince y último de cada mes. EL(LA) TRABAJADOR(A) manifiesta su conformidad para que su salario le pueda ser pagado a través de depósito en cuenta bancaria, tarjeta de débito, transferencias o cualquier otro medio, en el entendido de que los gastos que originen estos medios alternativos de pago serán cubiertos por EL PATRÓN. Por tanto, se acuerda que la constancia de depósito bancario correspondiente, el comprobante fiscal digital por internet (CFDI), así como el listado de nómina proporcionado a la institución bancaria, aun cuando no estén firmados por EL(LA) TRABAJADOR(A), serán constancias fehacientes del pago del salario, de los conceptos y montos salariales cubiertos, así como de las deducciones al mismo. Sin embargo, EL (LA) TRABAJADOR(A) también deberá firmar recibos salariales si EL PATRÓN así lo dispone.', b: false },
    ], lm, y, pw, lh, fs);
    y += 4;

    // QUINTA
    y = this.checkPageBreak(doc, y);
    y = this.drawInlineSegs(doc, [
      { t: 'QUINTA. -', b: true },
      { t: ' La incapacidad para laborar por accidente o enfermedad de trabajo solo podrán justificarse legalmente con la constancia que expida el Instituto Mexicano del Seguro Social; en tal supuesto, se deberá entregar al patrón de inmediato la constancia correspondiente, el mismo día de su expedición.', b: false },
    ], lm, y, pw, lh, fs);
    y += 4;

    // SEXTA – Obligaciones (lista)
    y = this.checkPageBreak(doc, y);
    y = this.drawInlineSegs(doc, [
      { t: 'SEXTA. -', b: true },
      { t: ' Son obligaciones de EL(LA) TRABAJADOR(A) de manera enunciativa mas no limitativa las siguientes:', b: false },
    ], lm, y, pw, lh, fs);
    y += 2;

    const colListNum  = lm + 10;
    const colListBody = lm + 26;
    const pwList      = pw - (colListBody - lm);
    const obligaciones = [
      { n: 'I.',    t: 'EL(LA) TRABAJADOR(A) se obliga a observar con especial cuidado su aspecto personal, usar en forma diaria durante su jornada de trabajo el uniforme, gafete y equipo de protección proporcionados por EL PATRÓN en relación a las áreas que apliquen.' },
      { n: 'II.',   t: 'EL(LA) TRABAJADOR(A) se obliga a firmar cualquier medio de control de asistencia que EL PATRÓN instrumente, con el fin de verificar las horas de entrada y de salida al trabajo.' },
      { n: 'III.',  t: 'EL(LA) TRABAJADOR(A) se obliga a asistir puntualmente a los cursos, sesiones de grupo y demás actividades que le señale EL PATRÓN y/o la Comisión Mixta de Capacitación, Adiestramiento y Productividad, y que formen parte del proceso de capacitación y adiestramiento, atender las indicaciones de las personas que impartan la capacitación y adiestramiento, cumplir con los programas respectivos y presentar los exámenes de conocimientos y aptitud que sean requeridos y en general, a cumplir con las obligaciones que establece el artículo 153-D y demás relativos de la Ley Federal del Trabajo.' },
      { n: 'IV.',   t: 'Dar aviso inmediato a EL PATRÓN, de las causas justificadas que le impidan concurrir a su trabajo.' },
      { n: 'V.',    t: 'EL(LA) TRABAJADOR(A) se obliga a acatar las disposiciones de seguridad e higiene, que se llevan a efecto en los centros de trabajo donde EL PATRÓN designe para el desarrollo de sus actividades.' },
      { n: 'VI.',   t: 'EL(LA) TRABAJADOR(A) se obliga a someterse a un examen médico, con lo que se dará inicio al expediente médico que en términos de las Normas Oficiales Mexicanas de la secretaria de Trabajo y Previsión Social debe contar cada expediente, de acuerdo con la Ley Federal del Trabajo y el Reglamento Interior del trabajo, así como a someterse a los exámenes médicos posteriores que en forma periódica y/o por campañas de actualización de expediente ordene EL PATRÓN ante el médico que este designe.' },
      { n: 'VII.',  t: 'EL(LA) TRABAJADOR(A) se obliga a observar y respetar las disposiciones del reglamento interior del trabajo que existe en la Empresa.' },
      { n: 'VIII.', t: 'EL(LA) TRABAJADOR(A) se obliga a mantener en perfecto estado de limpieza y orden el área donde prestará su trabajo, así como la maquinaria, material, equipo y herramienta, comprometiéndose también a no sustraer cualquier objeto de trabajo proporcionado para el desempeño de sus labores, por EL PATRÓN restituyendo los insumos que no utilice en sus funciones del trabajo.' },
      { n: 'IX.',   t: 'EL(LA) TRABAJADOR(A) se obliga a no divulgar en forma alguna los datos personales a que tenga acceso con motivo de la presente relación laboral.' },
      { n: 'X.',    t: 'EL(LA) TRABAJADOR(A) se obliga a guardar y no divulgar en forma alguna, escrupulosamente los secretos técnicos, comerciales, de financiamiento, tecnologías, así como de fabricación y funcionamiento de los productos a cuya elaboración concurra directa o indirectamente, o de los cuales tengan conocimiento por razón del trabajo que desempeñen, así como de los asuntos administrativos de carácter reservado, cuya divulgación pueda causar perjuicio a la empresa, a terceros o a clientes.' },
      { n: 'XI.',   t: 'EL(LA) TRABAJADOR(A) se obliga expresamente a prestar bajo dirección, dependencia y subordinación de EL PATRÓN y/o de los representantes de éste (representante legal, jefe de personal, jefe inmediato, jefe de turno, supervisor, etc.) sus servicios y conocimientos técnicos y profesionales en cualesquiera de las labores que se le asigne de acuerdo a las necesidades propias de EL PATRÓN con todo esmero y cuidado cuidando siempre en cumplir estrictamente las órdenes e indicaciones que reciba respecto de la forma y términos para el desarrollo de su trabajo, rindiendo a la brevedad posible toda clase de informes que le sean requeridos, otorgando desde este momento su consentimiento para que sea cambiado de puesto, labor, tarea, etc., siempre que se respete su salario, cumpliendo con sus obligaciones y con las instrucciones dadas para el mejor desarrollo de esa o esas actividades.' },
      { n: 'XII.',  t: 'En caso de cambio de domicilio EL (LA) TRABAJADOR(A) se obliga a dar aviso al patrón de dicho cambio, dentro de los cinco días siguientes a que ésta ocurra.' },
      { n: 'XIII.', t: 'EL(LA) TRABAJADOR(A) se obliga a cumplir con todas y cada una de las disposiciones que marca el artículo 134 de la Ley Federal del Trabajo y demás leyes aplicables a la materia.' },
    ];

    for (const ob of obligaciones) {
      y = this.checkPageBreak(doc, y);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(fs);
      doc.text(ob.n, colListNum, y);
      doc.setFont('helvetica', 'normal');
      const lines: string[] = doc.splitTextToSize(ob.t, pwList);
      doc.text(lines[0], colListBody, y); y += lh;
      for (let i = 1; i < lines.length; i++) { y = this.checkPageBreak(doc, y); doc.text(lines[i], colListBody, y); y += lh; }
    }
    y += 4;

    // SÉPTIMA – Prohibiciones
    y = this.checkPageBreak(doc, y);
    y = this.drawInlineSegs(doc, [
      { t: 'SÉPTIMA. -', b: true },
      { t: ' Queda estrictamente prohibido para EL (LA) TRABAJADOR(A) lo siguiente:', b: false },
    ], lm, y, pw, lh, fs);
    y += 2;

    const prohibiciones = [
      { n: 'I.',   t: 'Revelar información relacionada con la seguridad ya sea de la empresa y sus bienes, de sus socios, los familiares de los socios y los colaboradores.' },
      { n: 'II.',  t: 'Hacer mal uso de los bienes muebles e inmuebles de la empresa, ni extraer de las instalaciones bien alguno, sin previa autorización por escrito de EL PATRÓN, en caso de que incumpla con esta disposición, se sujetará a lo previsto en el artículo 47 de la Ley Federal del Trabajo, reservándose el derecho EL PATRÓN de dar aviso a las autoridades correspondientes.' },
      { n: 'III.', t: 'Laborar tiempo extraordinario, excepto en el caso de que fuera solicitado por escrito por EL PATRÓN en cualquier momento y para la ejecución de trabajos determinados.' },
      { n: 'IV.',  t: 'Cometer injurias en contra de la empresa y sus bienes, de sus socios, los familiares de los socios y los colaboradores.' },
      { n: 'V.',   t: 'Agredir física y/o psicológicamente a los socios, clientes, colaboradores y a los familiares de éstos.' },
      { n: 'VI.',  t: 'Las dispuestas en el artículo 135 de la Ley Federal del Trabajo y demás leyes aplicables a la materia.' },
    ];

    for (const pr of prohibiciones) {
      y = this.checkPageBreak(doc, y);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(fs);
      doc.text(pr.n, colListNum, y);
      doc.setFont('helvetica', 'normal');
      const lines: string[] = doc.splitTextToSize(pr.t, pwList);
      doc.text(lines[0], colListBody, y); y += lh;
      for (let i = 1; i < lines.length; i++) { y = this.checkPageBreak(doc, y); doc.text(lines[i], colListBody, y); y += lh; }
    }
    y += 4;

    // OCTAVA – Rescisión
    y = this.checkPageBreak(doc, y);
    y = this.drawInlineSegs(doc, [
      { t: 'OCTAVA. -', b: true },
      { t: ' Serán causales de rescisión del presente contrato las siguientes:', b: false },
    ], lm, y, pw, lh, fs);
    y += 2;

    const rescisiones = [
      { n: 'I.',  t: 'Cometer EL(LA) TRABAJADOR(A) en contra de EL PATRÓN cualesquiera de las circunstancias contempladas en el artículo 47 de la Ley Federal del Trabajo, y demás leyes aplicables a la materia.' },
      { n: 'II.', t: 'Incumplimiento por parte de EL(LA) TRABAJADOR(A) a las disposiciones contenidas en el presente contrato, el Reglamento Interior de Trabajo y demás disposiciones que emita EL PATRÓN.' },
    ];
    for (const rs of rescisiones) {
      y = this.checkPageBreak(doc, y);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(fs);
      doc.text(rs.n, colListNum, y);
      doc.setFont('helvetica', 'normal');
      const lines: string[] = doc.splitTextToSize(rs.t, pwList);
      doc.text(lines[0], colListBody, y); y += lh;
      for (let i = 1; i < lines.length; i++) { y = this.checkPageBreak(doc, y); doc.text(lines[i], colListBody, y); y += lh; }
    }
    y += 4;

    // NOVENA – Jornada
    y = this.checkPageBreak(doc, y);
    y = this.drawInlineSegs(doc, [
      { t: 'NOVENA.-', b: true },
      { t: ' La duración de la jornada semanal de labores será de 48 horas en jornada diurna, de 45 horas la mixta, distribuidas en 8hrs diarias tomando como día de descanso los DOMINGOS con fundamento en lo dispuesto por el artículo 59 de la Ley Federal del Trabajo, trabajador y patrón acuerdan que podrán repartir las horas de trabajo, a fin de que EL(LA) TRABAJADOR(A) pueda disfrutar el reposo del sábado en la tarde o cualquier modalidad equivalente, como pudiera ser entre otras, el disfrutar de un día más de descanso a la semana adicional a su día de descanso semanal, sin que por tal circunstancia se considere que al excederse en la jornada diaria máxima de labores se presten servicios extraordinarios, por lo que la jornada diaria que excede de ocho horas en ese periodo no será considerada como tiempo extra, sino que solo se están repartiendo las horas de trabajo para que EL(LA) TRABAJADOR(A) tenga más tiempo de reposo durante la semana.', b: false },
    ], lm, y, pw, lh, fs);
    y += 4;
    y = this.checkPageBreak(doc, y);
    y = this.drawInlineSegs(doc, [{ t: 'En caso de que la jornada de trabajo sea continua, se le concederá al trabajador un descanso de una hora, el cual EL(LA) TRABAJADOR(A) lo disfrutará para reposo o tomar alimentos fuera del lugar o área de trabajo donde preste sus servicios a la hora establecida de manera previa por EL PATRÓN y no podrá salir de las instalaciones durante ese tiempo, pero en ese periodo no estará a disposición de EL PATRÓN, y se acuerda que debido a que cada trabajador toma sus alimentos o periodos de descanso en distintos momentos, resulta entonces imposible que EL PATRÓN pueda supervisar o vigilar el inicio, conclusión, y efectivo disfrute del periodo de descanso intermedio durante la jornada de labores, por lo que, en todo caso quedará a cargo exclusivo de EL(LA) TRABAJADOR(A) disfrutar de ese periodo de reposo de manera obligatoria, por lo que se presumirá siempre que se tomó o disfrutó ese descanso.', b: false }], lm, y, pw, lh, fs);
    y += 4;
    y = this.checkPageBreak(doc, y);
    y = this.drawInlineSegs(doc, [{ t: 'EL PATRON podrá exigir una jornada continua o interrumpida o distribuir las horas de trabajo de cada día o semana; de acuerdo con lo anterior, el patrón fijará libremente el horario u horarios respectivos de labores, en la inteligencia de que, si desea variar de un sistema a otro el horario, lo podrá hacer en cualquier momento, sin condición alguna y bastando únicamente para ello una comunicación o aviso con por lo menos tres días de anticipación.', b: false }], lm, y, pw, lh, fs);
    y += 4;

    // DÉCIMA – Confidencialidad
    y = this.checkPageBreak(doc, y);
    y = this.drawInlineSegs(doc, [
      { t: 'DÉCIMA. -', b: true },
      { t: ' Se acuerda que toda documentación, información, datos y demás circunstancias que llegue a conocer EL (LA) TRABAJADOR(A) con relación a la empresa de EL PATRÓN, métodos de producción, sistemas administrativos u operativos, formulas y composiciones de productos finales o intermedios, clientes, y proveedores, se considerará como información confidencial, por lo que éste deberá mantener el secreto correspondiente, pues se le prohíbe divulgar o publicar tales conocimientos. En todo caso, EL (LA) TRABAJADOR(A) quedará sujeto a las sanciones penales, civiles y laborales que resulten con motivo de la violación a la confidencialidad y lealtad debidas.', b: false },
    ], lm, y, pw, lh, fs);
    y += 3;
    y = this.checkPageBreak(doc, y);
    y = this.drawInlineSegs(doc, [{ t: 'Así mismo, queda convenida en forma expresa entre las partes que toda la documentación e información que le sea proporcionado o que llegue a tener EL (LA) TRABAJADOR(A) para el desempeño de su trabajo materia de este contrato, se considera su contenido como confidencial, estándole prohibido, divulgarlo o publicarlo, a terceras personas.', b: false }], lm, y, pw, lh, fs);
    y += 3;
    y = this.checkPageBreak(doc, y);
    y = this.drawInlineSegs(doc, [{ t: 'También, queda prohibido a EL (LA) TRABAJADOR(A) difamar o desacreditar a EL PATRON durante o después de terminada la relación de trabajo.', b: false }], lm, y, pw, lh, fs);
    y += 3;
    y = this.checkPageBreak(doc, y);
    y = this.drawInlineSegs(doc, [{ t: 'Las partes reconocen que con motivo de la celebración de este contrato pueden llegar a intercambiar datos personales, según dicho término se define en la ley federal de protección de datos personales en posesión de particulares, por lo que en virtud de este acto consienten recíprocamente la obtención, uso, divulgación, almacenamiento, manejo y tratamiento en cualquier forma de dichos tratos por la parte opuesta, únicamente para los fines y efectos que se deriven de este contrato.', b: false }], lm, y, pw, lh, fs);
    y += 3;
    y = this.checkPageBreak(doc, y);
    y = this.drawInlineSegs(doc, [{ t: 'En razón de lo anterior, las partes se obligan a otorgar tratamiento confidencial a la totalidad de los datos personales que obtengan o lleguen a obtener por virtud del presente contrato de la parte opuesta, para lo cual deberán tomar las medidas necesarias para garantizar el manejo legítimo, controlado e informado de cualquier dato personal por sí o sus empleados, dependientes, asociados, afiliados o cualquier otra persona con la que tengan relación y en virtud de la cual el dato personal pudiera ser obtenido, como si se tratara de información propia.', b: false }], lm, y, pw, lh, fs);
    y += 3;
    y = this.checkPageBreak(doc, y);
    y = this.drawInlineSegs(doc, [{ t: 'Las partes no podrán difundir, comunicar, transferir o divulgar por cualquier medio los datos personales contenidos en el presente contrato o que lleguen a obtener por la celebración del mismo de la otra parte, a cualquier tercero, excepto cuando dicha difusión, comunicación, transferencia o divulgación sea inherente o necesaria para el cumplimiento de los fines de este contrato, o sea requerida por mantenimiento de autoridad competente, sujetándose en caso de incumplimiento a las sanciones que para el caso establecen los artículos 63, 64, 65 y 66 de la ley federal de protección de datos personales en posesión de particulares.', b: false }], lm, y, pw, lh, fs);
    y += 3;
    y = this.checkPageBreak(doc, y);
    y = this.drawInlineSegs(doc, [{ t: 'En caso de duda al respecto del tratamiento que pueda o no darse a cualquier dato personal de alguna de las partes, la parte dudosa deberá solicitar aclaración y autorización para dichos efectos a la otra, en tanto no sea resuelta la duda, se entenderá que la parte dudosa no está autorizada para tratar el dato personal en cuestión.', b: false }], lm, y, pw, lh, fs);
    y += 4;

    // DÉCIMA PRIMERA
    y = this.checkPageBreak(doc, y);
    y = this.drawInlineSegs(doc, [
      { t: 'DÉCIMA PRIMERA. –', b: true },
      { t: ' EL (LA) TRABAJADOR(A) será capacitado o adiestrado en los términos de los planes y programas establecidos o que se establezcan en la empresa, conforma a lo dispuesto por la Ley Federal del Trabajo.', b: false },
    ], lm, y, pw, lh, fs);
    y += 4;

    // DECIMA SEGUNDA
    y = this.checkPageBreak(doc, y);
    y = this.drawInlineSegs(doc, [
      { t: 'DECIMA SEGUNDA. –', b: true },
      { t: ' EL (LA) TRABAJADOR(A) tendrá derecho al disfrute y pago de vacaciones y prima vacacional, así como al aguinaldo, de acuerdo con los montos y condiciones mínimas previstas por la Ley Federal del Trabajo.', b: false },
    ], lm, y, pw, lh, fs);
    y += 4;

    // DÉCIMO TERCERA – Beneficiarios
    y = this.checkPageBreak(doc, y);
    y = this.drawInlineSegs(doc, [
      { t: 'DÉCIMO TERCERA. –', b: true },
      { t: ' De conformidad con el artículo 25 fracción X de la LFT, EL(LA) TRABAJADOR(A) en este acto, bajo protesta de decir verdad, libre y voluntariamente, señala como su beneficiario a la persona que se indica en la siguiente tabla y que para el supuesto en que dicha persona fallezca o faltará antes o simultáneamente que él o si rechazará ser el beneficiario de éste, EL(LA) TRABAJADOR(A) señala como beneficiario sustituto a la persona indicada en la misma tabla bajo dicha denominación.', b: false },
    ], lm, y, pw, lh, fs);
    y += 4;

    // Tabla beneficiarios
    y = this.checkPageBreak(doc, y);
    const colBen1 = lm;
    const colBen2 = lm + pw * 0.6;
    const wBen1 = pw * 0.6;
    const wBen2 = pw * 0.4;
    const hdrH = 7;
    const rowH = 8;

    // Fila header beneficiario
    doc.setFillColor(220, 220, 220); doc.setDrawColor(0); doc.setLineWidth(0.3);
    doc.rect(colBen1, y, wBen1, hdrH, 'FD');
    doc.rect(colBen2, y, wBen2, hdrH, 'FD');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(20, 20, 20);
    doc.text('NOMBRE COMPLETO BENEFICIARIO', colBen1 + wBen1 / 2, y + hdrH / 2 + 1.5, { align: 'center' });
    doc.text('PARENTESCO O AFINIDAD', colBen2 + wBen2 / 2, y + hdrH / 2 + 1.5, { align: 'center' });
    y += hdrH;
    // Fila dato beneficiario
    doc.setFillColor(255, 255, 255); doc.rect(colBen1, y, wBen1, rowH, 'FD'); doc.rect(colBen2, y, wBen2, rowH, 'FD');
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
    doc.text(data.benNombre1 || '', colBen1 + 2, y + rowH / 2 + 1.5);
    doc.text(data.benParentesco1 || '', colBen2 + 2, y + rowH / 2 + 1.5);
    y += rowH + 3;

    // Fila header sustituto
    doc.setFillColor(220, 220, 220);
    doc.rect(colBen1, y, wBen1, hdrH, 'FD'); doc.rect(colBen2, y, wBen2, hdrH, 'FD');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8);
    doc.text('NOMBRE COMPLETO BENEFICIARIO SUSTITUTO', colBen1 + wBen1 / 2, y + hdrH / 2 + 1.5, { align: 'center' });
    doc.text('PARENTESCO O AFINIDAD', colBen2 + wBen2 / 2, y + hdrH / 2 + 1.5, { align: 'center' });
    y += hdrH;
    // Fila dato sustituto
    doc.setFillColor(255, 255, 255); doc.rect(colBen1, y, wBen1, rowH, 'FD'); doc.rect(colBen2, y, wBen2, rowH, 'FD');
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
    doc.text(data.benNombreSust1 || '', colBen1 + 2, y + rowH / 2 + 1.5);
    doc.text(data.benParentescoSust1 || '', colBen2 + 2, y + rowH / 2 + 1.5);
    y += rowH + 4;

    // Párrafos post tabla
    doc.setFontSize(fs);
    y = this.checkPageBreak(doc, y);
    y = this.drawInlineSegs(doc, [{ t: 'Manifiesta EL (LA) TRABAJADOR(A) que las personas señaladas como sus beneficiarios en la tabla anterior, son designadas por el mismo en pleno uso de sus facultades legales, sin coacción física o moral o vicios en el consentimiento, por lo es su voluntad que se respete dicha decisión por parte de EL PATRÓN, de las autoridades laborales y de las personas referidas en el artículo 501 reformado de la Ley Federal del Trabajo, es decir, que ninguna persona puede tener derecho al pago de sus salarios y prestaciones laborales devengadas y no cobradas a su muerte o las que se generen por su fallecimiento o desaparición derivada de un acto delincuencial, salvo las designadas como beneficiarias y su sustituto para el supuesto de que dicha persona fallezca o faltará antes o simultáneamente que éste, señalados en la tabla anterior, independientemente que no sean las mismas en el orden de prioridad del artículo 501 referido.', b: false }], lm, y, pw, lh, fs);
    y += 3;
    y = this.checkPageBreak(doc, y);
    y = this.drawInlineSegs(doc, [{ t: 'Expresa EL PATRÓN a través de su representante, que está de acuerdo en la designación de beneficiarios por parte EL(LA) TRABAJADOR(A) y por lo tanto, será a estas personas a las que les liquidé las cantidades de dinero que resulten por estos conceptos, salvo alguna nueva designación posterior de beneficiarios o revocación de los ya designados con anterioridad que haga EL (LA) TRABAJADOR(A) o alguna resolución en contrario dictada por la autoridad laboral, en cuyo caso EL PATRÓN se sujetará a los nuevos beneficiarios o a los términos legales contenidos en dicha resolución, o a la Ley Federal del Trabajo.', b: false }], lm, y, pw, lh, fs);
    y += 4;

    // DÉCIMA CUARTA
    y = this.checkPageBreak(doc, y);
    y = this.drawInlineSegs(doc, [
      { t: 'DÉCIMA CUARTA. -', b: true },
      { t: ' El presente contrato obliga a las partes a lo expresamente pactado, conforme a lo que señala al diverso 31 de la Ley Federal del Trabajo y que esta regulará todo lo que no haya sido contemplado en el presente contrato.', b: false },
    ], lm, y, pw, lh, fs);
    y += 3;
    y = this.checkPageBreak(doc, y);
    y = this.drawInlineSegs(doc, [{ t: 'En todo caso EL PATRÓN se reserva el derecho de hacer valer las acciones que las leyes civiles y penales establecen en contra de las personas que violen las disposiciones apegadas a derecho y a las buenas costumbres.', b: false }], lm, y, pw, lh, fs);
    y += 3;
    y = this.checkPageBreak(doc, y);
    y = this.drawInlineSegs(doc, [
      { t: 'Ambas partes están de acuerdo en que, para la interpretación de este Contrato, se someten a los Tribunales de Trabajo de la ciudad de ', b: false },
      { t: `${data.ciudad}, ${data.estadoComparecencia}.`, b: true },
    ], lm, y, pw, lh, fs);
    y += 4;

    // DECIMA QUINTA
    y = this.checkPageBreak(doc, y);
    y = this.drawInlineSegs(doc, [
      { t: 'DECIMA QUINTA. -', b: true },
      { t: ' Será a cargo de EL (LA) TRABAJADOR(A) el pago de cualquier impuesto, cuota o aportación fiscal que le corresponda, requerimiento de pensión alimenticia de acuerdo con las leyes, por lo que EL PATRÓN podrá retener de su salario las cantidades correspondientes.', b: false },
    ], lm, y, pw, lh, fs);
    y += 3;
    y = this.checkPageBreak(doc, y);
    y = this.drawInlineSegs(doc, [{ t: 'Se aplicarán las normas de la Ley Federal del Trabajo respecto de todo lo no previsto expresamente en este contrato.', b: false }], lm, y, pw, lh, fs);
    y += 5;

    // ── Lugar y fecha de firma ───────────────────────────────────────────────
    y = this.checkPageBreak(doc, y);
    y = this.drawInlineSegs(doc, [
      { t: 'Se celebra este contrato en ', b: false },
      { t: data.ciudad, b: true }, { t: ', ', b: false }, { t: data.estadoComparecencia, b: true }, { t: ', el día ', b: false },
      { t: data.dia, b: true }, { t: ' de ', b: false },
      { t: data.mes, b: true }, { t: ' de ', b: false }, { t: data.anio, b: true },
      { t: ', y se firma por duplicado, recibiendo copias las partes del mismo.', b: false },
    ], lm, y, pw, lh, fs);
    y += 20;

    // ── Firmas ──────────────────────────────────────────────────────────────
    y = this.checkPageBreak(doc, y + 20);
    const sigW = 70;
    const leftSigX  = lm + 10;
    const rightSigX = 210 - this.RM - 10 - sigW;

    doc.setDrawColor(60, 60, 60); doc.setLineWidth(0.3);
    doc.line(leftSigX, y, leftSigX + sigW, y);
    doc.line(rightSigX, y, rightSigX + sigW, y);
    y += 5;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(fs); doc.setTextColor(20, 20, 20);
    doc.text('EL PATRÓN.', leftSigX + sigW / 2, y, { align: 'center' });
    doc.text('EL(LA) TRABAJADOR(A)', rightSigX + sigW / 2, y, { align: 'center' });
  }

  private drawClause(doc: jsPDF, num: string, text: string, lm: number, y: number, pw: number, lh: number, fs: number): number {
    const numStr = num.length > 0 ? num + ' ' : '';
    doc.setFont('helvetica', 'bold'); doc.setFontSize(fs); doc.setTextColor(20, 20, 20);
    const numW = doc.getTextWidth(numStr);
    doc.setFont('helvetica', 'normal');
    const firstLineArr = doc.splitTextToSize(text, pw - numW);
    const firstLine = firstLineArr[0] ?? '';
    const remainingText = text.split(/\s+/).slice(firstLine.trim().split(/\s+/).length).join(' ');
    const restLines = remainingText.length > 0 ? doc.splitTextToSize(remainingText, pw) : [];
    if (numStr.length > 0) { doc.setFont('helvetica', 'bold'); doc.setFontSize(fs); doc.text(numStr, lm, y); }
    doc.setFont('helvetica', 'normal'); doc.setFontSize(fs);
    const fw = firstLine.trim().split(' ');
    if (fw.length > 1 && restLines.length > 0) {
      const lw = doc.getTextWidth(firstLine.trim());
      const sp = (pw - numW - lw + doc.getTextWidth(' ') * (fw.length - 1)) / (fw.length - 1);
      let cx = lm + numW;
      for (const word of fw) { doc.text(word, cx, y); cx += doc.getTextWidth(word) + sp; }
    } else { doc.text(firstLine, lm + numW, y); }
    y += lh;
    for (let i = 0; i < restLines.length; i++) {
      y = this.checkPageBreak(doc, y);
      const line = restLines[i]; const isLast = i === restLines.length - 1; const words = line.trim().split(' ');
      if (isLast || words.length <= 1) { doc.text(line, lm, y); }
      else {
        const lw = doc.getTextWidth(line.trim());
        const sp = (pw - lw + doc.getTextWidth(' ') * (words.length - 1)) / (words.length - 1);
        let cx = lm;
        for (const word of words) { doc.text(word, cx, y); cx += doc.getTextWidth(word) + sp; }
      }
      y += lh;
    }
    return y;
  }

  private drawInlineSegs(doc: jsPDF, segs: { t: string; b: boolean }[], lm: number, y: number, pw: number, lh: number, fs: number): number {
    const plain = segs.map(s => s.t).join('');
    const boldMap: boolean[] = [];
    for (const seg of segs) { for (let i = 0; i < seg.t.length; i++) boldMap.push(seg.b); }
    const lines: string[] = doc.splitTextToSize(plain, pw);
    let charCursor = 0;
    for (let li = 0; li < lines.length; li++) {
      y = this.checkPageBreak(doc, y);
      const line = lines[li]; const isLast = li === lines.length - 1; const words = line.trim().split(' ');
      const wordMeta: { w: string; bold: boolean; width: number }[] = [];
      let tmpCursor = charCursor;
      for (const word of words) {
        while (tmpCursor < plain.length && plain[tmpCursor] === ' ') tmpCursor++;
        const isBold = tmpCursor < boldMap.length && boldMap[tmpCursor];
        doc.setFont('helvetica', isBold ? 'bold' : 'normal'); doc.setFontSize(fs);
        wordMeta.push({ w: word, bold: isBold, width: doc.getTextWidth(word) });
        tmpCursor += word.length;
      }
      doc.setFont('helvetica', 'normal'); doc.setFontSize(fs);
      const naturalSpaceW = doc.getTextWidth(' ');
      let spaceW: number;
      if (isLast || words.length <= 1) { spaceW = naturalSpaceW; }
      else { const totalW = wordMeta.reduce((s, m) => s + m.width, 0); spaceW = (pw - totalW) / (words.length - 1); }
      let cx = lm;
      for (const meta of wordMeta) {
        while (charCursor < plain.length && plain[charCursor] === ' ') charCursor++;
        doc.setFont('helvetica', meta.bold ? 'bold' : 'normal'); doc.setFontSize(fs); doc.setTextColor(20, 20, 20);
        doc.text(meta.w, cx, y);
        cx += meta.width + spaceW; charCursor += meta.w.length;
      }
      if (!isLast) charCursor += 1;
      y += lh;
    }
    return y;
  }
}
