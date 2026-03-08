import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';

export interface EmpleadoVacacionesPdf {
  nombre: string;
  fechaIngreso: string;
  antiguedad: number;
  totalVacaciones: number;
  diasTomados: number;
  diasPorTomarPrevious: number;
  diasPorTomarCurrent: number;
  saldoTotal: number;
}

export interface SolicitudVacacionesPdf {
  startDate: string;
  endDate: string;
  daysCount: number;
  requestDate: string;
  vacationYear?: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class ReportVacacionesPdfService {

  async generate(empleado: EmpleadoVacacionesPdf, solicitud: SolicitudVacacionesPdf): Promise<void> {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const logoBase64 = await this.loadLogoBase64();

    this.drawCopia(doc, 5, empleado, solicitud, logoBase64);

    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    doc.save(`SolicitudVacaciones_${today}.pdf`);
  }

  private async loadLogoBase64(): Promise<string | null> {
    try {
      const response = await fetch('/assets/logo_gris.png');
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

  private drawCopia(
    doc: jsPDF,
    sy: number,
    empleado: EmpleadoVacacionesPdf,
    solicitud: SolicitudVacacionesPdf,
    logoBase64: string | null
  ): void {
    const lm = 12;
    const pw = 186;

    // ---- Logo ----
    if (logoBase64) {
      doc.addImage(logoBase64, 'PNG', lm, sy + 1, 30, 20);
    } else {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(42, 122, 228);
      doc.text('INTEC', lm + 5, sy + 14);
    }

    // ---- Encabezado empresa ----
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(42, 122, 228);
    doc.text('INTEC DE JALISCO, S.A. DE C.V.', lm + 34, sy + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(60, 60, 60);
    doc.text('MISIONEROS  #2138    C.P. 44210', lm + 34, sy + 10.5);
    doc.text('COL. JARDINES DEL COUNTRY', lm + 34, sy + 14.5);
    doc.text('GUADALAJARA, JALISCO', lm + 34, sy + 18.5);

    // ---- Título ----
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(42, 122, 228);
    doc.text('SOLICITUD DE VACACIONES', 105, sy + 28, { align: 'center' });

    // ---- Tabla DATOS DE EMPLEADO ----
    // Estructura exacta de la imagen:
    //  [ DATOS DE EMPLEADO (encabezado azul, texto blanco) | FECHA (texto azul, sin fondo) ]
    //  [ Empleado: | valor | Fecha de ingreso: | valor     | fecha doc                     ]
    const tY = sy + 31;
    const colFechaW = 28;
    const colDatosW = pw - colFechaW;

    const r = 1.5; // radio esquinas redondeadas
    const headerH = 6;
    const rowH = 8;

    // Encabezado "DATOS DE EMPLEADO" — fondo azul, texto blanco, esquinas redondeadas arriba
    doc.setFillColor(42, 122, 228);
    doc.setDrawColor(42, 122, 228);
    doc.setLineWidth(0.3);
    doc.roundedRect(lm, tY, colDatosW, headerH, r, r, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text('DATOS DE EMPLEADO', lm + colDatosW / 2, tY + 4.2, { align: 'center' });

    // Encabezado "FECHA" — sin fondo, texto azul, esquinas redondeadas arriba
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(lm + colDatosW, tY, colFechaW, headerH, r, r, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(42, 122, 228);
    doc.text('FECHA', lm + colDatosW + colFechaW / 2, tY + 4.2, { align: 'center' });

    // Fila de datos: Empleado + Fecha de ingreso + Fecha doc
    doc.setDrawColor(42, 122, 228);
    doc.setLineWidth(0.3);

    // Celda izquierda (empleado + fecha ingreso combinados)
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(lm, tY + headerH, colDatosW, rowH, r, r, 'FD');

    // Celda derecha (fecha documento)
    doc.roundedRect(lm + colDatosW, tY + headerH, colFechaW, rowH, r, r, 'FD');

    // Línea vertical interna separando empleado de fecha ingreso
    const splitX = lm + colDatosW * 0.62;
    doc.setDrawColor(42, 122, 228);
    doc.line(splitX, tY + headerH, splitX, tY + headerH + rowH);

    const midY = tY + headerH + rowH / 2 + 1;

    // "Empleado:" label
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(42, 122, 228);
    doc.text('Empleado:', lm + 2, midY);

    // Nombre del empleado
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 30, 30);
    doc.text(empleado.nombre, lm + 18, midY);

    // "Fecha de ingreso:" en 2 líneas
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(42, 122, 228);
    doc.text('Fecha de', splitX + 2, midY - 1.5);
    doc.text('ingreso:', splitX + 2, midY + 2.5);

    // Valor fecha ingreso
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 30, 30);
    doc.text(empleado.fechaIngreso, splitX + 17, midY);

    // Fecha del documento (celda FECHA)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 30, 30);
    doc.text(this.fmtDate(solicitud.requestDate), lm + colDatosW + colFechaW / 2, midY, { align: 'center' });

    let y = tY + headerH + rowH + 5;

    // ---- Tabla Período de vacaciones (manual, esquinas redondeadas) ----
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 30, 30);
    doc.text('Periodo al que corresponden las vacaciones:', lm, y);
    y += 3;

    const vacYear = solicitud.vacationYear ?? new Date().getFullYear();
    const diasPendientes = empleado.saldoTotal - solicitud.daysCount;

    // Anchos de columna (suma = pw = 186)
    const pCols = [30, 20, 50, 22, 30, 34];
    const pHeads = [
      'Vacaciones\ncorrespondientes',
      'del año',
      'Periodo',
      'No. Dias\nsolicitados',
      'dias vac\npagadas',
      'vacaciones\npendientes'
    ];
    const pBody = [
      `${empleado.antiguedad} Año(s)`,
      `${vacYear}`,
      `${this.fmtDate(solicitud.startDate)}  al  ${this.fmtDate(solicitud.endDate)}`,
      `${solicitud.daysCount}`,
      `${empleado.diasTomados}`,
      `${diasPendientes}`
    ];

    const pHeadH = 9;
    const pBodyH = 7;
    const pTotalH = pHeadH + pBodyH;

    doc.setDrawColor(42, 122, 228);
    doc.setLineWidth(0.3);

    // Borde exterior redondeado
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(lm, y, pw, pTotalH, 1.5, 1.5, 'FD');

    // Línea divisoria entre cabecera y cuerpo
    doc.line(lm, y + pHeadH, lm + pw, y + pHeadH);

    // Líneas verticales internas + contenido
    let cx = lm;
    for (let i = 0; i < pCols.length; i++) {
      const cw = pCols[i];
      const cx2 = cx + cw;

      // Fondo gris en cabecera
      if (i === 0) {
        doc.setFillColor(200, 200, 200);
        doc.roundedRect(lm, y, pw, pHeadH, 1.5, 1.5, 'F');
      }

      // Línea vertical (excepto la última)
      if (i < pCols.length - 1) {
        doc.setDrawColor(42, 122, 228);
        doc.line(cx2, y, cx2, y + pTotalH);
      }

      // Texto cabecera (centrado, multilinea)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(42, 122, 228);
      const headLines = pHeads[i].split('\n');
      const headMidY = y + (pHeadH - headLines.length * 3) / 2 + 3;
      headLines.forEach((hl, li) => {
        doc.text(hl, cx + cw / 2, headMidY + li * 3, { align: 'center' });
      });

      // Texto cuerpo
      doc.setFont(i === 2 ? 'helvetica' : 'helvetica', i === 2 ? 'bold' : 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(30, 30, 30);
      doc.text(pBody[i], cx + cw / 2, y + pHeadH + pBodyH / 2 + 1.5, { align: 'center' });

      cx = cx2;
    }

    y += pTotalH + 5;

    // ---- Tabla Fecha inicio / Fecha término / Fecha reanudación (manual, esquinas redondeadas) ----
    const retorno = this.nextDay(solicitud.endDate);
    const fCols = [pw / 3, pw / 3, pw / 3];
    const fHeads = ['Fecha inicio:', 'Fecha termino:', 'Fecha de reanudación de actividades:'];
    const fBody  = [this.fmtDate(solicitud.startDate), this.fmtDate(solicitud.endDate), retorno];

    const fHeadH = 7;
    const fBodyH = 8;
    const fTotalH = fHeadH + fBodyH;

    doc.setDrawColor(42, 122, 228);
    doc.setLineWidth(0.3);

    // Borde exterior redondeado
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(lm, y, pw, fTotalH, 1.5, 1.5, 'FD');

    // Fondo gris cabecera
    doc.setFillColor(200, 200, 200);
    doc.roundedRect(lm, y, pw, fHeadH, 1.5, 1.5, 'F');

    // Línea divisoria cabecera/cuerpo
    doc.setDrawColor(42, 122, 228);
    doc.line(lm, y + fHeadH, lm + pw, y + fHeadH);

    let fx = lm;
    for (let i = 0; i < fCols.length; i++) {
      const cw = fCols[i];

      if (i < fCols.length - 1) {
        doc.line(fx + cw, y, fx + cw, y + fTotalH);
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(42, 122, 228);
      doc.text(fHeads[i], fx + cw / 2, y + fHeadH / 2 + 1.5, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(30, 30, 30);
      doc.text(fBody[i], fx + cw / 2, y + fHeadH + fBodyH / 2 + 1.5, { align: 'center' });

      fx += cw;
    }

    y += fTotalH + 5;

    // ---- Observaciones ----
    // Recuadro exterior con borde azul, etiqueta gris interior, línea de texto
    const obsH = 14;
    doc.setDrawColor(42, 122, 228);
    doc.setLineWidth(0.3);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(lm, y, pw, obsH, 1.5, 1.5, 'FD');

    // Etiqueta "Observaciones:" — sin fondo, texto azul
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(42, 122, 228);
    doc.text('Observaciones:', lm + 2, y + 4.8);

    // Línea horizontal de escritura
    doc.setDrawColor(120, 120, 120);
    doc.setLineWidth(0.2);
    doc.line(lm + 25, y + 6.5, lm + pw - 2, y + 6.5);
    doc.line(lm + 2, y + 11.5, lm + pw - 2, y + 11.5);

    y += obsH + 6;

    // ---- Firmas ----
    this.drawFirmas(doc, y);
  }

  private drawFirmas(doc: jsPDF, y: number): void {
    const lm = 12;
    const pw = 186;
    const gap = 3;
    const fw = (pw - gap * 3) / 4;
    const fh = 26;

    const firmas = [
      { top: 'Trabajador(a)', bottom: 'Firma' },
      { top: 'Aprobada:  Jefe directo\nEncargado de obra / Residente', bottom: 'Firma' },
      { top: 'Autoriza\nGerente de operaciones\n/ Administrativo', bottom: 'Firma' },
      { top: 'Enterado', bottom: 'Firma' }
    ];

    doc.setDrawColor(42, 122, 228);
    doc.setLineWidth(0.4);

    firmas.forEach((f, i) => {
      const x = lm + i * (fw + gap);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(x, y, fw, fh, 1.5, 1.5, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(42, 122, 228);
      const lines = f.top.split('\n');
      lines.forEach((line, li) => {
        doc.text(line, x + fw / 2, y + 4.5 + li * 3.8, { align: 'center' });
      });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(42, 122, 228);
      doc.text(f.bottom, x + fw / 2, y + fh - 2.5, { align: 'center' });
    });
  }

  private fmtDate(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  private nextDay(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T12:00:00');
    d.setDate(d.getDate() + 1);
    return d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
}
