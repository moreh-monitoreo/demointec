import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';

export interface EmpleadoPermisoPdf {
  nombre: string;
  fechaIngreso: string;
}

export interface SolicitudPermisoPdf {
  startDate: string;
  endDate: string;
  reason: string;
  withPay: boolean;
  requestDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReportPermisoPdfService {

  async generate(empleado: EmpleadoPermisoPdf, solicitud: SolicitudPermisoPdf): Promise<void> {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const logoBase64 = await this.loadLogoBase64();

    this.drawCopia(doc, 5, empleado, solicitud, logoBase64);

    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    doc.save(`SolicitudPermiso_${today}.pdf`);
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
    empleado: EmpleadoPermisoPdf,
    solicitud: SolicitudPermisoPdf,
    logoBase64: string | null
  ): void {
    const lm = 12;
    const pw = 186;
    const r = 1.5;

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
    doc.text('SOLICITUD DE PERMISO', 105, sy + 28, { align: 'center' });

    // ---- Tabla DATOS DE EMPLEADO ----
    const tY = sy + 31;
    const colFechaW = 28;
    const colDatosW = pw - colFechaW;
    const headerH = 6;
    const rowH = 8;

    // Encabezado "DATOS DE EMPLEADO" — fondo azul, texto blanco, esquinas redondeadas
    doc.setFillColor(42, 122, 228);
    doc.setDrawColor(42, 122, 228);
    doc.setLineWidth(0.3);
    doc.roundedRect(lm, tY, colDatosW, headerH, r, r, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text('DATOS DE EMPLEADO', lm + colDatosW / 2, tY + 4.2, { align: 'center' });

    // Encabezado "FECHA" — sin fondo, texto azul, esquinas redondeadas
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(lm + colDatosW, tY, colFechaW, headerH, r, r, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(42, 122, 228);
    doc.text('FECHA', lm + colDatosW + colFechaW / 2, tY + 4.2, { align: 'center' });

    // Fila de datos: celda izquierda (empleado + fecha ingreso) y celda derecha (fecha doc)
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(42, 122, 228);
    doc.roundedRect(lm, tY + headerH, colDatosW, rowH, r, r, 'FD');
    doc.roundedRect(lm + colDatosW, tY + headerH, colFechaW, rowH, r, r, 'FD');

    // Línea vertical interna separando empleado de fecha ingreso
    const splitX = lm + colDatosW * 0.62;
    doc.setDrawColor(42, 122, 228);
    doc.line(splitX, tY + headerH, splitX, tY + headerH + rowH);

    const midY = tY + headerH + rowH / 2 + 1;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(42, 122, 228);
    doc.text('Empleado:', lm + 2, midY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 30, 30);
    doc.text(empleado.nombre, lm + 18, midY);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(42, 122, 228);
    doc.text('Fecha de', splitX + 2, midY - 1.5);
    doc.text('ingreso:', splitX + 2, midY + 2.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 30, 30);
    doc.text(empleado.fechaIngreso, splitX + 17, midY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 30, 30);
    doc.text(this.fmtDate(solicitud.requestDate), lm + colDatosW + colFechaW / 2, midY, { align: 'center' });

    let y = tY + headerH + rowH + 6;

    // ---- PERMISO: Sin/Con goce de sueldo ----
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(42, 122, 228);
    doc.text('PERMISO', lm, y);
    y += 5;

    const sinGoce = !solicitud.withPay;
    const conGoce = solicitud.withPay;

    // Etiqueta "SIN GOCE DE SUELDO"
    doc.setFillColor(200, 200, 200);
    doc.roundedRect(lm, y, 38, 6.5, r, r, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(60, 60, 60);
    doc.text('SIN GOCE DE SUELDO', lm + 19, y + 4.5, { align: 'center' });

    // Checkbox sin goce
    doc.setDrawColor(42, 122, 228);
    doc.setLineWidth(0.3);
    doc.roundedRect(lm + 40, y + 1, 5, 5, 0.5, 0.5, 'D');
    if (sinGoce) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(30, 30, 30);
      doc.text('X', lm + 41.5, y + 5.2);
    }

    // Etiqueta "CON GOCE DE SUELDO"
    doc.setFillColor(200, 200, 200);
    doc.roundedRect(lm + 55, y, 38, 6.5, r, r, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(60, 60, 60);
    doc.text('CON GOCE DE SUELDO', lm + 74, y + 4.5, { align: 'center' });

    // Checkbox con goce
    doc.setDrawColor(42, 122, 228);
    doc.setLineWidth(0.3);
    doc.roundedRect(lm + 95, y + 1, 5, 5, 0.5, 0.5, 'D');
    if (conGoce) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(30, 30, 30);
      doc.text('X', lm + 96.5, y + 5.2);
    }

    y += 10;

    // ---- Etiqueta MOTIVO ----
    doc.setFillColor(200, 200, 200);
    doc.roundedRect(lm, y, 22, 5, r, r, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(42, 122, 228);
    doc.text('MOTIVO:', lm + 2, y + 3.6);
    y += 9;

    // ---- Checkboxes de motivo ----
    const motivos: { label: string; key: string }[] = [
      { label: 'DEFUNCIÓN', key: 'DEFUN' },
      { label: 'MATRIMONIO', key: 'MATRI' },
      { label: 'PATERNIDAD', key: 'PATER' },
      { label: 'ADOPCIÓN', key: 'ADOPT' },
      { label: 'OTRO', key: 'OTRO' }
    ];
    const razonUp = (solicitud.reason || '').toUpperCase();
    let cx = lm;
    for (const m of motivos) {
      const checked = razonUp.includes(m.key);
      doc.setDrawColor(42, 122, 228);
      doc.setLineWidth(0.3);
      doc.roundedRect(cx, y - 4, 4, 4, 0.5, 0.5, 'D');
      if (checked) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(30, 30, 30);
        doc.text('X', cx + 0.8, y - 0.8);
      }
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(30, 30, 30);
      doc.text(m.label, cx + 5.5, y - 0.8);
      cx += m.label.length * 1.85 + 8;
    }

    y += 8;

    // ---- Tabla Fechas (inicio / término / reanudación) ----
    const retorno = this.nextDay(solicitud.endDate);
    const fCols = [pw / 3, pw / 3, pw / 3];
    const fHeads = ['A partir del día:', 'Al día:', 'Debiéndome presentar a laborar:'];
    const fBody  = [this.fmtDate(solicitud.startDate), this.fmtDate(solicitud.endDate), retorno];

    const fHeadH = 7;
    const fBodyH = 8;
    const fTotalH = fHeadH + fBodyH;

    doc.setDrawColor(42, 122, 228);
    doc.setLineWidth(0.3);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(lm, y, pw, fTotalH, r, r, 'FD');

    doc.setFillColor(200, 200, 200);
    doc.roundedRect(lm, y, pw, fHeadH, r, r, 'F');

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
      doc.setFontSize(7.5);
      doc.setTextColor(30, 30, 30);
      doc.text(fBody[i], fx + cw / 2, y + fHeadH + fBodyH / 2 + 1.5, { align: 'center' });

      fx += cw;
    }

    y += fTotalH + 5;

    // ---- Observaciones ----
    const obsH = 14;
    doc.setDrawColor(42, 122, 228);
    doc.setLineWidth(0.3);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(lm, y, pw, obsH, r, r, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(42, 122, 228);
    doc.text('Observaciones:', lm + 2, y + 4.8);

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
    const fh = 18;

    const firmas = [
      { top: 'Trabajador(a)', bottom: 'Firma' },
      { top: 'Aprobada:  Jefe directo /\nEncargado de obra / Residente', bottom: 'Firma' },
      { top: 'Autoriza\nGerente de area', bottom: 'Firma' },
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
        doc.text(line, x + fw / 2, y + 3.5 + li * 3.5, { align: 'center' });
      });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(42, 122, 228);
      doc.text(f.bottom, x + fw / 2, y + fh - 2, { align: 'center' });
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
