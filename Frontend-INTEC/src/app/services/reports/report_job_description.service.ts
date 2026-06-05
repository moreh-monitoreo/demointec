import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { JobDescription, Activity, Responsibility, ChangeLogEntry } from '../../adapters/job-description.adapter';

@Injectable({ providedIn: 'root' })
export class ReportJobDescriptionService {
  private logoBase64: string | null = null;

  private async loadLogoBase64(): Promise<string> {
    if (this.logoBase64) return this.logoBase64;
    const response = await fetch('assets/logo.png');
    const blob = await response.blob();
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => { this.logoBase64 = reader.result as string; resolve(this.logoBase64!); };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  async generatePDF(
    job: JobDescription,
    activities: Activity[],
    responsibilities: Responsibility[],
    internalRelations: string[],
    externalRelations: string[],
    changeLog: ChangeLogEntry[],
    workSchedules: any[]
  ): Promise<void> {
    const pdf = new jsPDF('p', 'mm', 'letter');
    const PW   = pdf.internal.pageSize.getWidth();
    const PH   = pdf.internal.pageSize.getHeight();
    const M    = 15;          // margen lateral
    const CW   = PW - M * 2; // ancho de contenido (180 mm)
    const H_TOP = 23;         // altura de encabezado de página
    const TP   = '{totalPages}';

    const logoBase64 = await this.loadLogoBase64();

    // ── encabezado de página (se dibuja una sola vez por página) ──────────────
    const drawnPages = new Set<number>();
    const drawHeader = () => {
      const p = (pdf as any).getCurrentPageInfo().pageNumber;
      if (drawnPages.has(p)) return;
      drawnPages.add(p);
      // logo
      pdf.addImage(logoBase64, 'PNG', M, 5, 22, 14);
      // nombre empresa
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(70, 70, 70);
      pdf.text('INTEC DE JALISCO S.A. DE C.V.', M + 26, 13.5);
      // línea separadora
      pdf.setDrawColor(180, 180, 180);
      pdf.setLineWidth(0.35);
      pdf.line(M, H_TOP, PW - M, H_TOP);
      pdf.setTextColor(0, 0, 0);
    };

    // ── barra de sección ──────────────────────────────────────────────────────
    const sectionBar = (title: string, y: number, mainTitle = false): number => {
      const fill = mainTitle ? [55, 55, 55] : [100, 100, 100];
      const h    = mainTitle ? 7.5 : 6.5;
      const fs   = mainTitle ? 10  : 8.5;
      pdf.setFillColor(fill[0], fill[1], fill[2]);
      pdf.rect(M, y, CW, h, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(fs);
      pdf.setTextColor(255, 255, 255);
      pdf.text(title, PW / 2, y + h * 0.68, { align: 'center' });
      pdf.setTextColor(0, 0, 0);
      return y + h + 1;
    };

    // ── helper para autoTable ─────────────────────────────────────────────────
    const at = (options: any) =>
      autoTable(pdf, {
        margin: { left: M, right: M, top: H_TOP + 4, bottom: 28 },
        tableLineColor: [180, 180, 180],
        tableLineWidth: 0.2,
        didDrawPage: drawHeader,
        ...options
      });

    const lastY = () => (pdf as any).lastAutoTable.finalY;

    // espacio mínimo antes del pie de página — 28 mm de margen inferior
    const FOOTER_TOP = PH - 28;

    // si no cabe el contenido (needed mm) en la página actual, salta a una nueva
    const ensureSpace = (currentY: number, needed: number): number => {
      if (currentY + needed > FOOTER_TOP) {
        pdf.addPage();
        drawHeader();
        return H_TOP + 4;
      }
      return currentY;
    };

    // ── constantes de las matrices ────────────────────────────────────────────
    const VCOL_W  = 13;   // ancho columna vertical (Ejecuta / Supervisa / Autoriza / Individual / Compartida)
    const VCOL_H  = 22;   // alto mínimo header para texto rotado
    const HEADER_FILL: [number, number, number] = [238, 238, 238];
    const HEADER_TEXT: [number, number, number] = [30,  30,  30 ];

    // función para dibujar texto rotado y centrado dentro de una celda
    const drawRotated = (label: string, data: any) => {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.setTextColor(HEADER_TEXT[0], HEADER_TEXT[1], HEADER_TEXT[2]);
      const textW = pdf.getTextWidth(label);
      // Con angle:90 el texto sube desde el punto (x,y).
      // Para centrarlo verticalmente en la celda hay que partir desde:
      //   cellCenterY + textW/2  →  el texto sube hasta  cellCenterY - textW/2
      const cx = data.cell.x + data.cell.width  / 2;
      const cy = data.cell.y + data.cell.height / 2 + textW / 2;
      pdf.text(label, cx, cy, { angle: 90 });
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // PÁGINA 1
    // ═══════════════════════════════════════════════════════════════════════════
    drawHeader();
    let y = H_TOP + 4;

    // título principal
    y = sectionBar('DESCRIPTIVO DE PUESTO', y, true);
    y += 1;

    // ── I. Información general ────────────────────────────────────────────────
    y = sectionBar('I.- Información general del puesto', y);
    at({
      startY: y,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: { top: 2, bottom: 2, left: 3, right: 3 } },
      body: [
        [{ content: 'Nombre de puesto:', styles: { fontStyle: 'bold', textColor: [40, 40, 40] } }, job.job_title || ''],
        [{ content: 'Departamento:',     styles: { fontStyle: 'bold', textColor: [40, 40, 40] } }, job.department || ''],
      ],
      columnStyles: { 0: { cellWidth: 46 }, 1: { cellWidth: CW - 46 } }
    });
    y = lastY() + 5;

    // ── II. Razón de ser ──────────────────────────────────────────────────────
    y = sectionBar('II.- Razón de ser', y);
    at({
      startY: y,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: { top: 2.5, bottom: 2.5, left: 4, right: 4 } },
      body: [[`Objetivo: ${job.objective || ''}`]],
      columnStyles: { 0: { cellWidth: CW } }
    });
    y = lastY() + 5;

    // ── III. Funciones claves ─────────────────────────────────────────────────
    y = sectionBar('III.- Funciones claves', y);
    y += 2;

    // Subtítulo Matriz de Actividades — verificar espacio
    y = ensureSpace(y, 38);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Matriz de Actividades', M, y + 4);
    y += 7;

    at({
      startY: y,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: { top: 2.5, bottom: 2.5, left: 2.5, right: 2.5 }, valign: 'middle' },
      headStyles: {
        fillColor: HEADER_FILL,
        textColor: HEADER_TEXT,
        fontStyle: 'bold',
        minCellHeight: VCOL_H,
        lineColor: [180, 180, 180],
        lineWidth: 0.3
      },
      head: [[
        { content: '#',           styles: { halign: 'center', valign: 'middle', cellWidth: 9 } },
        { content: 'Descripción', styles: { valign: 'middle' } },
        { content: '',            styles: { cellWidth: VCOL_W } },
        { content: '',            styles: { cellWidth: VCOL_W } },
        { content: '',            styles: { cellWidth: VCOL_W } },
        { content: 'Frecuencia*\n(Diaria, Semanal,\nMensual, Trimestral,\nSemestral, Anual)',
          styles: { fontSize: 7, valign: 'middle', cellWidth: 44 } }
      ]],
      body: activities.length > 0
        ? activities.map((a, i) => [
            { content: String(i + 1), styles: { halign: 'center' } },
            a.description,
            { content: a.ejecuta   ? 'X' : '', styles: { halign: 'center', fontStyle: 'bold' } },
            { content: a.supervisa ? 'X' : '', styles: { halign: 'center', fontStyle: 'bold' } },
            { content: a.autoriza  ? 'X' : '', styles: { halign: 'center', fontStyle: 'bold' } },
            a.frecuencia
          ])
        : [[{ content: 'Sin actividades registradas', colSpan: 6,
              styles: { halign: 'center', textColor: [140, 140, 140], fontStyle: 'italic' } }]],
      columnStyles: {
        0: { cellWidth: 9 },
        2: { cellWidth: VCOL_W }, 3: { cellWidth: VCOL_W }, 4: { cellWidth: VCOL_W },
        5: { cellWidth: 44 }
      },
      didDrawCell: (data: any) => {
        if (data.section === 'head' && data.column.index === 2) drawRotated('Ejecuta',   data);
        if (data.section === 'head' && data.column.index === 3) drawRotated('Supervisa', data);
        if (data.section === 'head' && data.column.index === 4) drawRotated('Autoriza',  data);
      }
    });
    y = lastY() + 6;

    // Subtítulo Matriz de Responsabilidades — verificar que haya espacio suficiente
    // (necesitamos al menos el subtítulo + encabezado de tabla + 1 fila ≈ 38 mm)
    y = ensureSpace(y, 38);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Matriz de Responsabilidades', M, y + 4);
    y += 7;

    at({
      startY: y,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: { top: 2.5, bottom: 2.5, left: 2.5, right: 2.5 }, valign: 'middle' },
      headStyles: {
        fillColor: HEADER_FILL,
        textColor: HEADER_TEXT,
        fontStyle: 'bold',
        minCellHeight: VCOL_H,
        lineColor: [180, 180, 180],
        lineWidth: 0.3
      },
      head: [[
        { content: '#',           styles: { halign: 'center', valign: 'middle', cellWidth: 9 } },
        { content: 'Descripción', styles: { valign: 'middle' } },
        { content: '',            styles: { cellWidth: VCOL_W } },
        { content: '',            styles: { cellWidth: VCOL_W } },
        { content: 'Puestos y áreas involucradas', styles: { valign: 'middle', cellWidth: 52 } }
      ]],
      body: responsibilities.length > 0
        ? responsibilities.map((r, i) => [
            { content: String(i + 1), styles: { halign: 'center' } },
            r.description,
            { content: r.individual  ? 'X' : '', styles: { halign: 'center', fontStyle: 'bold' } },
            { content: r.compartida  ? 'X' : '', styles: { halign: 'center', fontStyle: 'bold' } },
            r.puestos_involucrados || ''
          ])
        : [[{ content: 'Sin responsabilidades registradas', colSpan: 5,
              styles: { halign: 'center', textColor: [140, 140, 140], fontStyle: 'italic' } }]],
      columnStyles: {
        0: { cellWidth: 9 },
        2: { cellWidth: VCOL_W }, 3: { cellWidth: VCOL_W },
        4: { cellWidth: 52 }
      },
      didDrawCell: (data: any) => {
        if (data.section === 'head' && data.column.index === 2) drawRotated('Individual', data);
        if (data.section === 'head' && data.column.index === 3) drawRotated('Compartida', data);
      }
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // PÁGINA 2
    // ═══════════════════════════════════════════════════════════════════════════
    pdf.addPage();
    drawHeader();
    y = H_TOP + 4;

    // ── IV. Relaciones estratégicas ───────────────────────────────────────────
    y = sectionBar('IV.- Relaciones estratégicas', y);
    const maxRel = Math.max(internalRelations.length, externalRelations.length, 1);
    at({
      startY: y,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: { top: 2, bottom: 2, left: 4, right: 4 } },
      headStyles: { fillColor: HEADER_FILL, textColor: HEADER_TEXT, fontStyle: 'bold', halign: 'center',
                    lineColor: [180, 180, 180], lineWidth: 0.3 },
      head: [['Internas', 'Externas']],
      body: Array.from({ length: maxRel }, (_, i) => [internalRelations[i] || '', externalRelations[i] || '']),
      columnStyles: { 0: { cellWidth: CW / 2 }, 1: { cellWidth: CW / 2 } }
    });
    y = lastY() + 16;

    // ── Organigrama ───────────────────────────────────────────────────────────
    pdf.setFont('helvetica', 'bolditalic');
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    const orgTitle = 'ESTRUCTURA ORGANIZACIONAL';
    const orgTW = pdf.getTextWidth(orgTitle);
    const orgTX = (PW - orgTW) / 2;
    pdf.text(orgTitle, orgTX, y);
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.35);
    pdf.line(orgTX, y + 1.5, orgTX + orgTW, y + 1.5);
    y += 14;

    const cx = PW / 2;
    const bW = 84;
    const bH = 13;
    const bX = cx - bW / 2;

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(0, 0, 0);

    // caja gerente
    pdf.setDrawColor(60, 60, 60);
    pdf.setLineWidth(0.6);
    pdf.rect(bX, y, bW, bH);
    const mgrText = pdf.splitTextToSize(job.org_manager || 'GERENTE DE OPERACIONES', bW - 8);
    pdf.text(mgrText, cx, y + bH / 2 + 1, { align: 'center', baseline: 'middle' });
    pdf.setLineWidth(0.4);
    pdf.line(cx, y + bH, cx, y + bH + 10);
    y += bH + 10;

    // caja supervisor
    pdf.setLineWidth(0.6);
    pdf.rect(bX, y, bW, bH);
    const supText = pdf.splitTextToSize(job.org_supervisor || 'INGENIERO RESIDENTE', bW - 8);
    pdf.text(supText, cx, y + bH / 2 + 1, { align: 'center', baseline: 'middle' });
    pdf.setLineWidth(0.4);
    pdf.line(cx, y + bH, cx, y + bH + 10);
    y += bH + 10;

    // hexágono: puesto actual
    const hW = 90;
    const hH = 19;
    const hOff = 12;
    const hX = cx - hW / 2;
    const hexPts: [number, number][] = [
      [hX + hOff, y],           [hX + hW - hOff, y],
      [hX + hW,   y + hH / 2],  [hX + hW - hOff, y + hH],
      [hX + hOff, y + hH],      [hX,              y + hH / 2]
    ];
    pdf.setLineWidth(0.6);
    for (let i = 0; i < hexPts.length; i++) {
      const n = hexPts[(i + 1) % hexPts.length];
      pdf.line(hexPts[i][0], hexPts[i][1], n[0], n[1]);
    }
    const jTitleLines = pdf.splitTextToSize(job.job_title || 'PUESTO ACTUAL', hW - hOff * 2 - 4);
    pdf.text(jTitleLines, cx, y + hH / 2 + 1, { align: 'center', baseline: 'middle' });

    // ═══════════════════════════════════════════════════════════════════════════
    // PÁGINA 3
    // ═══════════════════════════════════════════════════════════════════════════
    pdf.addPage();
    drawHeader();
    y = H_TOP + 4;

    // ── V. Características del perfil ─────────────────────────────────────────
    y = sectionBar('V.- Características generales del perfil', y);
    const sched = workSchedules
      .filter((s: any) => s.day_from || s.entry_time)
      .map((s: any) => {
        const rng = s.day_from ? `${s.day_from}${s.day_to ? ' a ' + s.day_to : ''}` : '';
        const hrs = s.entry_time ? `${s.entry_time}${s.exit_time ? ' a ' + s.exit_time : ''}` : '';
        return [rng, hrs].filter(Boolean).join(' de ');
      })
      .join(' / ');

    at({
      startY: y,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: { top: 2, bottom: 2, left: 3, right: 3 } },
      body: [
        [{ content: 'Sexo:',                        styles: { fontStyle: 'bold', halign: 'right', textColor: [40,40,40] } }, job.profile_gender            || ''],
        [{ content: 'Edad:',                        styles: { fontStyle: 'bold', halign: 'right', textColor: [40,40,40] } }, job.profile_age               || ''],
        [{ content: 'Estado civil:',                styles: { fontStyle: 'bold', halign: 'right', textColor: [40,40,40] } }, job.profile_marital_status    || ''],
        [{ content: 'Horario:',                     styles: { fontStyle: 'bold', halign: 'right', textColor: [40,40,40] } }, sched],
        [{ content: 'Disponibilidad para viajar:',  styles: { fontStyle: 'bold', halign: 'right', textColor: [40,40,40] } }, job.profile_travel_availability || ''],
        [{ content: 'Idiomas:',                     styles: { fontStyle: 'bold', halign: 'right', textColor: [40,40,40] } }, job.profile_languages         || ''],
        [{ content: 'Requerimientos extras:',       styles: { fontStyle: 'bold', halign: 'right', textColor: [40,40,40] } }, job.profile_extra_requirements || ''],
      ],
      columnStyles: { 0: { cellWidth: 62 }, 1: { cellWidth: CW - 62 } }
    });
    y = lastY() + 5;

    // ── VI. Conocimientos y habilidades ───────────────────────────────────────
    y = sectionBar('VI.- Conocimientos y habilidades', y);
    at({
      startY: y,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: { top: 2, bottom: 2, left: 3, right: 3 } },
      body: [
        [{ content: 'Escolaridad:',             styles: { fontStyle: 'bold', halign: 'right', textColor: [40,40,40] } }, job.education          || ''],
        [{ content: 'Especialidad (Requisito):', styles: { fontStyle: 'bold', halign: 'right', textColor: [40,40,40] } }, job.specialty          || ''],
        [{ content: 'Experiencia:',             styles: { fontStyle: 'bold', halign: 'right', textColor: [40,40,40] } }, job.experience         || ''],
        [{ content: 'Conocimientos técnicos:',  styles: { fontStyle: 'bold', halign: 'right', textColor: [40,40,40] } }, job.technical_knowledge || ''],
        [{ content: '*Software:',               styles: { fontStyle: 'bold', halign: 'right', textColor: [40,40,40] } }, job.software           || ''],
        [{ content: 'Equipos y maquinaria:',    styles: { fontStyle: 'bold', halign: 'right', textColor: [40,40,40] } }, job.equipment          || ''],
      ],
      columnStyles: { 0: { cellWidth: 62 }, 1: { cellWidth: CW - 62 } }
    });
    y = lastY() + 5;

    // ── Para uso de expediente ────────────────────────────────────────────────
    y = sectionBar('Para uso de expediente y Depto. De Personal', y);
    at({
      startY: y,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: { top: 2, bottom: 2, left: 4, right: 4 } },
      body: [[{ content: `Fecha: ${job.created_date || ''}`, styles: { textColor: [40,40,40] } }]],
      columnStyles: { 0: { cellWidth: CW } }
    });
    y = lastY() + 4;

    y = ensureSpace(y, 30);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(40, 40, 40);
    pdf.text('Autorización', M, y + 5);
    y += 8;
    at({
      startY: y,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: { top: 2, bottom: 2, left: 3, right: 3 } },
      headStyles: { fillColor: HEADER_FILL, textColor: HEADER_TEXT, fontStyle: 'bold', halign: 'center',
                    lineColor: [180,180,180], lineWidth: 0.3 },
      head: [['Elabora', 'Revisa', 'Autoriza']],
      body: [[job.created_by || '', job.reviewed_by || '', job.authorized_by || '']]
    });
    y = lastY() + 4;

    y = ensureSpace(y, 30);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(40, 40, 40);
    pdf.text('Control de cambios', M, y + 5);
    y += 8;
    at({
      startY: y,
      theme: 'grid',
      styles: { fontSize: 8.5, cellPadding: { top: 2.5, bottom: 2.5, left: 3, right: 3 } },
      headStyles: { fillColor: HEADER_FILL, textColor: HEADER_TEXT, fontStyle: 'bold',
                    lineColor: [180,180,180], lineWidth: 0.3 },
      head: [['#', 'Descripción', 'Fecha', 'Autor']],
      body: changeLog.length > 0
        ? changeLog.map((l, i) => [String(i + 1), l.description, l.date, l.author])
        : [[{ content: 'Sin cambios registrados', colSpan: 4,
              styles: { halign: 'center', textColor: [140,140,140], fontStyle: 'italic' } }]],
      columnStyles: { 0: { cellWidth: 8 }, 2: { cellWidth: 32 }, 3: { cellWidth: 52 } }
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // PIES DE PÁGINA (todas las páginas)
    // ═══════════════════════════════════════════════════════════════════════════
    const totalPages = (pdf as any).getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      pdf.setPage(p);

      const footerY = PH - 13;

      // firma líneas y etiquetas
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(0, 0, 0);
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.3);

      const sigLineLen  = 30;
      const sigCols     = [M, M + 50, M + 100];   // posiciones X de las 3 firmas
      const sigLabels   = ['Elaboró', 'Revisó', 'Autorizó'];

      sigCols.forEach((x, i) => {
        pdf.line(x, footerY, x + sigLineLen, footerY);      // línea de firma
        pdf.text(sigLabels[i], x, footerY + 4.5);           // etiqueta
      });

      // número de página — lado derecho, con margen suficiente
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Página ${p} de ${TP}`, PW - M, footerY + 4.5, { align: 'right' });
    }

    (pdf as any).putTotalPages(TP);
    pdf.save(`Descriptivo_${(job.job_title || 'Puesto').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
  }
}
