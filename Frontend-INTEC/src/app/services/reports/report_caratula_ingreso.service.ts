import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';

export interface CaratulaIngresoData {
  nombreEmpresa1: string;
  nombreCompleto: string;
  sexo: string;
  curp: string;
  rfc: string;
  imss: string;
  escolaridad: string;
  correo: string;
  fechaNac: string;
  lugarNac: string;
  estadoCivil: string;
  dependientes: string;
  domicilio: string;
  colonia: string;
  codigoPostal: string;
  ciudad: string;
  estado: string;
  tipoSanguineo: string;
  alergias: string;
  cirugias: string;
  contactoEmergencias: string;
  numeroEmergencias: string;
  periodoPago: string;
  bonos: string;
  comisiones: string;
  fechaIngreso: string;
  puesto: string;
  depto: string;
  sd: string;
  sdi: string;
  sMensual: string;
  ubicacionPago: string;
  numeroCuentaClave: string;
  beneficiario1: string;
  contactoBeneficiario1: string;
  parentesco1: string;
  porcentaje1: string;
  beneficiario2: string;
  contactoBeneficiario2: string;
  parentesco2: string;
  porcentaje2: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReportCaratulaIngresoService {

  async generate(data: CaratulaIngresoData): Promise<void> {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const logoBase64 = await this.loadLogoBase64();

    this.drawPage1(doc, data, logoBase64);
    doc.addPage();
    this.drawPage2(doc, data, logoBase64);

    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    doc.save(`CaratulaIngreso_${today}.pdf`);
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

  private drawPage1(doc: jsPDF, data: CaratulaIngresoData, logoBase64: string | null): void {
    const lm = 10;
    const pw = 190;
    const orange: [number, number, number] = [245, 133, 37];
    const darkGray: [number, number, number] = [60, 60, 60];

    // ---- Logo ----
    if (logoBase64) {
      doc.addImage(logoBase64, 'PNG', lm, 8, 18, 18);
    } else {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(42, 122, 228);
      doc.text('INTEC', lm + 4, 18);
    }

    // ---- Título ----
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(20, 20, 20);
    doc.text('CARATULA DE INGRESO', 105, 14, { align: 'center' });

    // ---- Código / revisión (esquina derecha) ----
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...darkGray);
    doc.text('Código: INTEC-RH-F-01', lm + pw, 10, { align: 'right' });
    doc.text('Revisión: 1', lm + pw, 14, { align: 'right' });
    doc.text('Vigente: 22/05/2024', lm + pw, 18, { align: 'right' });

    let y = 28;

    // ---- Nombre de la empresa ----
    this.drawLabeledField(doc, lm, y, pw, 8, 'NOMBRE DE LA EMPRESA:', data.nombreEmpresa1, orange);
    y += 10;

    // ---- Fila: Nombre completo | Sexo ----
    const nombreW = 140;
    const sexoW = pw - nombreW;
    this.drawLabeledField(doc, lm, y, nombreW, 8, 'NOMBRE COMPLETO:', data.nombreCompleto, orange);
    this.drawLabeledField(doc, lm + nombreW, y, sexoW, 8, 'SEXO:', data.sexo, orange);
    y += 8;

    // ---- Fila: CURP | RFC | IMSS ----
    const curpW = 70;
    const rfcW = 60;
    const imssW = pw - curpW - rfcW;
    this.drawLabeledField(doc, lm, y, curpW, 8, 'CURP:', data.curp, orange);
    this.drawLabeledField(doc, lm + curpW, y, rfcW, 8, 'RFC:', data.rfc, orange);
    this.drawLabeledField(doc, lm + curpW + rfcW, y, imssW, 8, 'IMSS:', data.imss, orange);
    y += 8;

    // ---- Fila: Escolaridad | Correo ----
    const escolaridadW = 70;
    const correoW = pw - escolaridadW;
    this.drawLabeledField(doc, lm, y, escolaridadW, 8, 'ESCOLARIDAD:', data.escolaridad, orange);
    this.drawLabeledField(doc, lm + escolaridadW, y, correoW, 8, 'CORREO:', data.correo, orange);
    y += 8;

    // ---- Fila: Fecha Nac | Lugar Nac ----
    const fechaNacW = 55;
    const lugarNacW = pw - fechaNacW;
    this.drawLabeledField(doc, lm, y, fechaNacW, 8, 'FECHA DE NAC:', data.fechaNac, orange);
    this.drawLabeledField(doc, lm + fechaNacW, y, lugarNacW, 8, 'LUGAR DE NAC:', data.lugarNac, orange);
    y += 8;

    // ---- Fila: Estado Civil | Dependientes ----
    const estCivilW = 70;
    const depW = pw - estCivilW;
    this.drawLabeledField(doc, lm, y, estCivilW, 8, 'ESTADO CIVIL:', data.estadoCivil, orange);
    this.drawLabeledField(doc, lm + estCivilW, y, depW, 8, 'DEPENDIENTES ECONÓMICOS:', data.dependientes, orange);
    y += 8;

    // ---- Fila: Domicilio (full width) ----
    this.drawLabeledField(doc, lm, y, pw, 8, 'DOMICILIO:', data.domicilio, orange);
    y += 8;

    // ---- Fila: Colonia | Código Postal ----
    const coloniaW = 110;
    const cpW = pw - coloniaW;
    this.drawLabeledField(doc, lm, y, coloniaW, 8, 'COLONIA:', data.colonia, orange);
    this.drawLabeledField(doc, lm + coloniaW, y, cpW, 8, 'CÓDIGO POSTAL:', data.codigoPostal, orange);
    y += 8;

    // ---- Fila: Ciudad | Estado ----
    const ciudadW = 110;
    const estadoW = pw - ciudadW;
    this.drawLabeledField(doc, lm, y, ciudadW, 8, 'CIUDAD:', data.ciudad, orange);
    this.drawLabeledField(doc, lm + ciudadW, y, estadoW, 8, 'ESTADO:', data.estado, orange);
    y += 10;

    // ---- Sección: Datos médicos ----
    this.drawSectionHeader(doc, lm, y, pw, 7, 'DATOS MÉDICOS', orange);
    y += 7;

    // Fila: Tipo sanguíneo | Alergias | Cirugías
    const tipoW = 40;
    const alergiasW = 80;
    const cirugiasW = pw - tipoW - alergiasW;
    this.drawLabeledField(doc, lm, y, tipoW, 8, 'TIPO SANGUÍNEO:', data.tipoSanguineo, orange);
    this.drawLabeledField(doc, lm + tipoW, y, alergiasW, 8, 'ALERGIAS:', data.alergias, orange);
    this.drawLabeledField(doc, lm + tipoW + alergiasW, y, cirugiasW, 8, 'CIRUGÍAS:', data.cirugias, orange);
    y += 8;

    // Fila: Contacto emergencias | Número emergencias
    const contactoW = 110;
    const numEmergW = pw - contactoW;
    this.drawLabeledField(doc, lm, y, contactoW, 8, 'CONTACTO DE EMERGENCIAS:', data.contactoEmergencias, orange);
    this.drawLabeledField(doc, lm + contactoW, y, numEmergW, 8, 'NÚMERO:', data.numeroEmergencias, orange);
    y += 10;

    // ---- Sección: Datos laborales ----
    this.drawSectionHeader(doc, lm, y, pw, 7, 'DATOS LABORALES', orange);
    y += 7;

    // Fila: Periodo de pago | Bonos | Comisiones
    const periodoW = 65;
    const bonosW = 65;
    const comisionesW = pw - periodoW - bonosW;
    this.drawLabeledField(doc, lm, y, periodoW, 8, 'PERIODO DE PAGO:', data.periodoPago, orange);
    this.drawLabeledField(doc, lm + periodoW, y, bonosW, 8, 'BONOS:', data.bonos, orange);
    this.drawLabeledField(doc, lm + periodoW + bonosW, y, comisionesW, 8, 'COMISIONES:', data.comisiones, orange);
    y += 8;

    // Fila: Fecha ingreso | Puesto | Depto
    const fechaIngW = 50;
    const puestoW = 80;
    const deptoW = pw - fechaIngW - puestoW;
    this.drawLabeledField(doc, lm, y, fechaIngW, 8, 'FECHA DE INGRESO:', data.fechaIngreso, orange);
    this.drawLabeledField(doc, lm + fechaIngW, y, puestoW, 8, 'PUESTO:', data.puesto, orange);
    this.drawLabeledField(doc, lm + fechaIngW + puestoW, y, deptoW, 8, 'DEPTO:', data.depto, orange);
    y += 8;

    // Fila: S.D. | S.D.I. | S. Mensual
    const sdW = 50;
    const sdiW = 70;
    const sMensualW = pw - sdW - sdiW;
    this.drawLabeledField(doc, lm, y, sdW, 8, 'S.D.:', data.sd, orange);
    this.drawLabeledField(doc, lm + sdW, y, sdiW, 8, 'S.D.I.:', data.sdi, orange);
    this.drawLabeledField(doc, lm + sdW + sdiW, y, sMensualW, 8, 'S. MENSUAL:', data.sMensual, orange);
    y += 8;

    // Fila: Ubicación de pago | Número de cuenta clave
    const ubicPagoW = 110;
    const numCuentaW = pw - ubicPagoW;
    this.drawLabeledField(doc, lm, y, ubicPagoW, 8, 'UBICACIÓN DE PAGO:', data.ubicacionPago, orange);
    this.drawLabeledField(doc, lm + ubicPagoW, y, numCuentaW, 8, 'NÚM. CUENTA / CLAVE:', data.numeroCuentaClave, orange);
    y += 10;

    // ---- Sección: Beneficiarios ----
    this.drawSectionHeader(doc, lm, y, pw, 7, 'BENEFICIARIOS', orange);
    y += 7;

    // Encabezados de tabla beneficiarios
    const benNomW = 70;
    const benConW = 45;
    const benParW = 45;
    const benPorW = pw - benNomW - benConW - benParW;

    this.drawTableHeader(doc, lm, y, 6, orange, [
      { label: 'BENEFICIARIO', w: benNomW },
      { label: 'NÚMERO DE CONTACTO', w: benConW },
      { label: 'PARENTESCO', w: benParW },
      { label: 'PORCENTAJE', w: benPorW },
    ]);
    y += 6;

    // Beneficiario 1
    this.drawTableRow(doc, lm, y, 8, [
      { value: data.beneficiario1, w: benNomW },
      { value: data.contactoBeneficiario1, w: benConW },
      { value: data.parentesco1, w: benParW },
      { value: data.porcentaje1, w: benPorW },
    ]);
    y += 8;

    // Beneficiario 2 — solo se dibuja si tiene nombre
    if (data.beneficiario2?.trim()) {
      this.drawTableRow(doc, lm, y, 8, [
        { value: data.beneficiario2, w: benNomW },
        { value: data.contactoBeneficiario2, w: benConW },
        { value: data.parentesco2, w: benParW },
        { value: data.porcentaje2, w: benPorW },
      ]);
    }
  }

  private drawPage2(doc: jsPDF, _data: CaratulaIngresoData, logoBase64: string | null): void {
    const lm = 10;
    const pw = 190;
    const orange: [number, number, number] = [245, 133, 37];
    const darkGray: [number, number, number] = [60, 60, 60];

    // ---- Logo ----
    if (logoBase64) {
      doc.addImage(logoBase64, 'PNG', lm, 8, 18, 18);
    } else {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(42, 122, 228);
      doc.text('INTEC', lm + 4, 18);
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(20, 20, 20);
    doc.text('CARATULA DE INGRESO', 105, 14, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...darkGray);
    doc.text('Código: INTEC-RH-F-01', lm + pw, 10, { align: 'right' });
    doc.text('Revisión: 1', lm + pw, 14, { align: 'right' });
    doc.text('Vigente: 22/05/2024', lm + pw, 18, { align: 'right' });

    let y = 30;

    // ---- Control de revisiones ----
    this.drawSectionHeader(doc, lm, y, pw, 7, 'CONTROL DE REVISIONES', orange);
    y += 7;

    const revNoW = 25;
    const revDescW = 70;
    const revFechaW = 35;
    const revRealizoW = 35;
    const revAproboW = pw - revNoW - revDescW - revFechaW - revRealizoW;

    this.drawTableHeader(doc, lm, y, 6, orange, [
      { label: 'NO. DE REVISIÓN', w: revNoW },
      { label: 'DESCRIPCIÓN', w: revDescW },
      { label: 'FECHA VIGENCIA', w: revFechaW },
      { label: 'REALIZÓ', w: revRealizoW },
      { label: 'APROBÓ', w: revAproboW },
    ]);
    y += 6;

    // Fila fija: revisión 1 - Documento Original
    this.drawTableRow(doc, lm, y, 8, [
      { value: '1', w: revNoW },
      { value: 'Documento Original', w: revDescW },
      { value: '22/05/2024', w: revFechaW },
      { value: 'RRHH/Mares Magallanes María', w: revRealizoW },
      { value: '', w: revAproboW },
    ]);
    y += 8;

    // 2 filas vacías adicionales
    for (let i = 0; i < 2; i++) {
      this.drawTableRow(doc, lm, y, 8, [
        { value: '', w: revNoW },
        { value: '', w: revDescW },
        { value: '', w: revFechaW },
        { value: '', w: revRealizoW },
        { value: '', w: revAproboW },
      ]);
      y += 8;
    }
  }

  private drawSectionHeader(
    doc: jsPDF, x: number, y: number, w: number, h: number, label: string,
    orange: [number, number, number]
  ): void {
    doc.setFillColor(orange[0], orange[1], orange[2]);
    doc.setDrawColor(200, 100, 0);
    doc.setLineWidth(0.3);
    doc.rect(x, y, w, h, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(label, x + w / 2, y + h / 2 + 1.5, { align: 'center' });
  }

  private drawLabeledField(
    doc: jsPDF, x: number, y: number, w: number, h: number,
    label: string, value: string, orange: [number, number, number]
  ): void {
    doc.setFillColor(255, 248, 240);
    doc.setDrawColor(orange[0], orange[1], orange[2]);
    doc.setLineWidth(0.3);
    doc.rect(x, y, w, h, 'FD');

    if (label) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6);
      doc.setTextColor(orange[0], orange[1], orange[2]);
      doc.text(label, x + 1.5, y + 3);
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(20, 20, 20);
    const maxW = w - 3;
    const lines = doc.splitTextToSize(value, maxW);
    doc.text(lines[0] ?? '', x + 1.5, y + h - 2);
  }

  private drawTableHeader(
    doc: jsPDF, x: number, y: number, h: number,
    orange: [number, number, number],
    cols: { label: string; w: number }[]
  ): void {
    let cx = x;
    for (const col of cols) {
      doc.setFillColor(orange[0], orange[1], orange[2]);
      doc.setDrawColor(200, 100, 0);
      doc.setLineWidth(0.3);
      doc.rect(cx, y, col.w, h, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(255, 255, 255);
      const lines = doc.splitTextToSize(col.label, col.w - 2);
      doc.text(lines, cx + col.w / 2, y + h / 2 + 1, { align: 'center' });
      cx += col.w;
    }
  }

  private drawTableRow(
    doc: jsPDF, x: number, y: number, h: number,
    cols: { value: string; w: number }[]
  ): void {
    let cx = x;
    for (const col of cols) {
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.2);
      doc.rect(cx, y, col.w, h, 'FD');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(20, 20, 20);
      const lines = doc.splitTextToSize(col.value, col.w - 3);
      doc.text(lines[0] ?? '', cx + 1.5, y + h / 2 + 1.5);
      cx += col.w;
    }
  }
}
