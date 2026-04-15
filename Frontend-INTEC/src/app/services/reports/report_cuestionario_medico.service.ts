import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';

export interface CuestionarioMedicoData {
  nombre: string;
  edad: string;
  fecha: string;
  puesto: string;
  sexo: string;
  edoCivil: string;
  imss: string;
  telefono: string;
  tipoSangre: string;

  // Antecedentes familiares (SI/NO por condición y familiar)
  afCancerSi: boolean; afCancerNo: boolean; afCancerPadre: boolean; afCancerMadre: boolean; afCancerAbuelos: boolean; afCancerTios: boolean; afCancerObs: string;
  afDiabetesSi: boolean; afDiabetesNo: boolean; afDiabetesPadre: boolean; afDiabetesMadre: boolean; afDiabetesAbuelos: boolean; afDiabetesTios: boolean; afDiabetesObs: string;
  afCorazonSi: boolean; afCorazonNo: boolean; afCorazonPadre: boolean; afCorazonMadre: boolean; afCorazonAbuelos: boolean; afCorazonTios: boolean; afCorazonObs: string;
  afHipertensionSi: boolean; afHipertensionNo: boolean; afHipertensionPadre: boolean; afHipertensionMadre: boolean; afHipertensionAbuelos: boolean; afHipertensionTios: boolean; afHipertensionObs: string;
  afConvulsionesSi: boolean; afConvulsionesNo: boolean; afConvulsionesPadre: boolean; afConvulsionesMadre: boolean; afConvulsionesAbuelos: boolean; afConvulsionesTios: boolean; afConvulsionesObs: string;
  afMentalesSi: boolean; afMentalesNo: boolean; afMentalesPadre: boolean; afMentalesMadre: boolean; afMentalesAbuelos: boolean; afMentalesTios: boolean; afMentalesObs: string;
  afTiroidesSi: boolean; afTiroidesNo: boolean; afTiroidesPadre: boolean; afTiroidesMadre: boolean; afTiroidesAbuelos: boolean; afTiroidesTios: boolean; afTiroidesObs: string;
  afDemensiaSi: boolean; afDemensiaNo: boolean; afDemensiaPadre: boolean; afDemensiaMadre: boolean; afDemensiaAbuelos: boolean; afDemensiaTios: boolean; afDemensiaObs: string;

  // Antecedentes personales patológicos
  ppDiabetesSi: boolean; ppDiabetesNo: boolean;
  ppPresionAltaSi: boolean; ppPresionAltaNo: boolean;
  ppPresionBajaSi: boolean; ppPresionBajaNo: boolean;
  ppCorazonSi: boolean; ppCorazonNo: boolean;
  ppVaricesSi: boolean; ppVaricesNo: boolean;
  ppConvulsionesSi: boolean; ppConvulsionesNo: boolean;
  ppMigranasSi: boolean; ppMigranasNo: boolean;
  ppHepatitisSi: boolean; ppHepatitisNo: boolean;
  ppHerniasSi: boolean; ppHerniasNo: boolean;
  ppAnsiedadSi: boolean; ppAnsiedadNo: boolean;
  ppAsmaSi: boolean; ppAsmaNo: boolean;
  ppTumoresSi: boolean; ppTumoresNo: boolean;
  ppObesidadSi: boolean; ppObesidadNo: boolean;
  ppColitisSi: boolean; ppColitisNo: boolean;
  ppGastritisSi: boolean; ppGastritisNo: boolean;
  ppVesiculaSi: boolean; ppVesiculaNo: boolean;
  ppTiroidesSi: boolean; ppTiroidesNo: boolean;
  ppMiopiaSi: boolean; ppMiopiaNo: boolean;
  ppAstigmatismoSi: boolean; ppAstigmatismoNo: boolean;

  // Hábitos
  tabSi: boolean; tabNo: boolean; tabEdad: string; tabDiario: boolean; tabSemanal: boolean; tabMensual: boolean; tabEsporadico: boolean; tabCantidad: string;
  alcSi: boolean; alcNo: boolean; alcEdad: string; alcDiario: boolean; alcSemanal: boolean; alcMensual: boolean; alcEsporadico: boolean; alcCantidad: string;
  droTipo: string; droEspecifique: string;
  aleTipo: string; aleEspecifique: string;

  // Cirugías y lesiones
  cirugiasSi: boolean; cirugiasNo: boolean; cirugiasDetalle: string;
  tatuajesSi: boolean; tatuajesNo: boolean; tatuajesDetalle: string;
  perforacionesSi: boolean; perforacionesNo: boolean; perforacionesDetalle: string;
  esguincesSi: boolean; esguincesNo: boolean; esguincesDetalle: string;
  luxacionesSi: boolean; luxacionesNo: boolean; luxacionesDetalle: string;
  fracturasSi: boolean; fracturasNo: boolean; fracturasDetalle: string;
  amputacionesSi: boolean; amputacionesNo: boolean; amputacionesDetalle: string;
  partosSi: boolean; partosNo: boolean; partosDetalle: string;
  cesareasSi: boolean; cesareasNo: boolean; cesareasDetalle: string;
  abortosSi: boolean; abortosNo: boolean; abortosDetalle: string;
}

@Injectable({ providedIn: 'root' })
export class ReportCuestionarioMedicoService {

  async generate(data: CuestionarioMedicoData): Promise<void> {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const logoBase64 = await this.loadLogoBase64();
    this.drawPage(doc, data, logoBase64);
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    doc.save(`CuestionarioMedico_${today}.pdf`);
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

  private drawPage(doc: jsPDF, data: CuestionarioMedicoData, logo: string | null): void {
    const lm = 10;
    const pw = 190;
    const blue: [number, number, number] = [31, 73, 125];
    const lightBlue: [number, number, number] = [189, 215, 238];
    const darkGray: [number, number, number] = [100, 100, 100];
    const black: [number, number, number] = [0, 0, 0];
    const white: [number, number, number] = [255, 255, 255];
    const sectionBg: [number, number, number] = [31, 73, 125];

    let y = 8;

    // ── Logo + Título ──────────────────────────────────────────────────────
    if (logo) {
      doc.addImage(logo, 'PNG', lm, y, 18, 18);
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...black);
    doc.text('CUESTIONARIO MEDICO', lm + 30 + (pw - 30) / 2, y + 9.5, { align: 'center' });

    y += 17;

    // ── Datos del encabezado ───────────────────────────────────────────────
    const fieldH = 5.5;
    const gap = 0.5;

    // Fila 1: NOMBRE (115) | EDAD (35) | FECHA (40) — total = 190
    const w1n = 115, w1e = 35, w1f = pw - w1n - w1e;
    this.drawLabelField(doc, lm, y, w1n, fieldH, 'NOMBRE:', data.nombre, blue, white, black, darkGray);
    this.drawLabelField(doc, lm + w1n, y, w1e, fieldH, 'EDAD:', data.edad, blue, white, black, darkGray);
    this.drawLabelField(doc, lm + w1n + w1e, y, w1f, fieldH, 'FECHA:', data.fecha, blue, white, black, darkGray);

    y += fieldH + gap;

    // Fila 2: PUESTO (115) | SEXO+EDO.CIVIL (75) — total = 190
    const w2p = 115, w2s = pw - w2p;
    this.drawLabelField(doc, lm, y, w2p, fieldH, 'PUESTO:', data.puesto, blue, white, black, darkGray);
    // Sexo con checkboxes M/F + Edo. Civil
    doc.setFillColor(...white);
    doc.setDrawColor(...darkGray);
    doc.setLineWidth(0.2);
    doc.rect(lm + w2p, y, w2s, fieldH, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.setTextColor(...blue);
    doc.text('SEXO:', lm + w2p + 2, y + 3.8);
    const sexoX = lm + w2p + 14;
    this.drawCheckbox(doc, sexoX, y + 1.2, 3, data.sexo === 'M' || data.sexo === 'Masculino', darkGray, black);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...black);
    doc.setFontSize(6);
    doc.text('M', sexoX + 4, y + 3.8);
    this.drawCheckbox(doc, sexoX + 10, y + 1.2, 3, data.sexo === 'F' || data.sexo === 'Femenino', darkGray, black);
    doc.text('F', sexoX + 14, y + 3.8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...blue);
    doc.text('EDO. CIVIL:', lm + w2p + 32, y + 3.8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...black);
    doc.text(data.edoCivil ?? '', lm + w2p + 50, y + 3.8);

    y += fieldH + gap;

    // Fila 3: IMSS (60) | TELÉFONO (70) | TIPO SANGRE (60) — total = 190
    const w3i = 60, w3t = 70, w3s = pw - w3i - w3t;
    this.drawLabelField(doc, lm, y, w3i, fieldH, 'NÚMERO DE IMSS:', data.imss, blue, white, black, darkGray);
    this.drawLabelField(doc, lm + w3i, y, w3t, fieldH, 'NÚMERO TELEFÓNICO:', data.telefono, blue, white, black, darkGray);
    this.drawLabelField(doc, lm + w3i + w3t, y, w3s, fieldH, 'TIPO DE SANGRE:', data.tipoSangre, blue, white, black, darkGray);

    y += fieldH + gap + 1;

    // ── SECCIÓN 1: ANTECEDENTES FAMILIARES ────────────────────────────────
    y = this.drawSectionHeader(doc, lm, y, pw, 'ANTECEDENTES FAMILIARES', sectionBg, white);
    y += 0.5;

    // Encabezado tabla
    const cols = { condicion: 52, si: 8, no: 8, padre: 14, madre: 14, abuelos: 14, tios: 14, obs: pw - 52 - 8 - 8 - 14 - 14 - 14 - 14 };
    const rowH = 5;
    let xc = lm;
    doc.setFillColor(...lightBlue);
    doc.setDrawColor(...darkGray);
    doc.setLineWidth(0.2);
    doc.rect(lm, y, pw, rowH, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.setTextColor(...blue);
    const afHeaders = ['CONDICIÓN', 'SI', 'NO', 'PADRE', 'MADRE', 'ABUELOS', 'TIOS', 'OBSERVACIONES'];
    const afWidths = [cols.condicion, cols.si, cols.no, cols.padre, cols.madre, cols.abuelos, cols.tios, cols.obs];
    afWidths.forEach((w, i) => {
      doc.text(afHeaders[i], xc + w / 2, y + 3.7, { align: 'center' });
      xc += w;
      if (i < afWidths.length - 1) doc.line(xc, y, xc, y + rowH);
    });
    y += rowH;

    const afRows: { label: string; si: boolean; no: boolean; padre: boolean; madre: boolean; abuelos: boolean; tios: boolean; obs: string }[] = [
      { label: 'CÁNCER', si: data.afCancerSi, no: data.afCancerNo, padre: data.afCancerPadre, madre: data.afCancerMadre, abuelos: data.afCancerAbuelos, tios: data.afCancerTios, obs: data.afCancerObs },
      { label: 'DIABETES', si: data.afDiabetesSi, no: data.afDiabetesNo, padre: data.afDiabetesPadre, madre: data.afDiabetesMadre, abuelos: data.afDiabetesAbuelos, tios: data.afDiabetesTios, obs: data.afDiabetesObs },
      { label: 'ENFERMEDADES DEL CORAZÓN', si: data.afCorazonSi, no: data.afCorazonNo, padre: data.afCorazonPadre, madre: data.afCorazonMadre, abuelos: data.afCorazonAbuelos, tios: data.afCorazonTios, obs: data.afCorazonObs },
      { label: 'HIPERTENSIÓN', si: data.afHipertensionSi, no: data.afHipertensionNo, padre: data.afHipertensionPadre, madre: data.afHipertensionMadre, abuelos: data.afHipertensionAbuelos, tios: data.afHipertensionTios, obs: data.afHipertensionObs },
      { label: 'CONVULSIONES', si: data.afConvulsionesSi, no: data.afConvulsionesNo, padre: data.afConvulsionesPadre, madre: data.afConvulsionesMadre, abuelos: data.afConvulsionesAbuelos, tios: data.afConvulsionesTios, obs: data.afConvulsionesObs },
      { label: 'ENFERMEDADES MENTALES', si: data.afMentalesSi, no: data.afMentalesNo, padre: data.afMentalesPadre, madre: data.afMentalesMadre, abuelos: data.afMentalesAbuelos, tios: data.afMentalesTios, obs: data.afMentalesObs },
      { label: 'TIROIDES', si: data.afTiroidesSi, no: data.afTiroidesNo, padre: data.afTiroidesPadre, madre: data.afTiroidesMadre, abuelos: data.afTiroidesAbuelos, tios: data.afTiroidesTios, obs: data.afTiroidesObs },
      { label: 'DEMENSIAS', si: data.afDemensiaSi, no: data.afDemensiaNo, padre: data.afDemensiaPadre, madre: data.afDemensiaMadre, abuelos: data.afDemensiaAbuelos, tios: data.afDemensiaTios, obs: data.afDemensiaObs },
    ];

    afRows.forEach((row, idx) => {
      const bg: [number, number, number] = idx % 2 === 0 ? white : [242, 247, 252];
      doc.setFillColor(...bg);
      doc.setDrawColor(...darkGray);
      doc.rect(lm, y, pw, rowH, 'FD');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6);
      doc.setTextColor(...black);
      let cx = lm;
      doc.text(row.label, cx + 2, y + 3.7);
      cx += cols.condicion;
      doc.line(cx, y, cx, y + rowH);
      doc.text(row.si ? 'X' : '', cx + cols.si / 2, y + 3.7, { align: 'center' });
      cx += cols.si;
      doc.line(cx, y, cx, y + rowH);
      doc.text(row.no ? 'X' : '', cx + cols.no / 2, y + 3.7, { align: 'center' });
      cx += cols.no;
      doc.line(cx, y, cx, y + rowH);
      doc.text(row.padre ? 'X' : '', cx + cols.padre / 2, y + 3.7, { align: 'center' });
      cx += cols.padre;
      doc.line(cx, y, cx, y + rowH);
      doc.text(row.madre ? 'X' : '', cx + cols.madre / 2, y + 3.7, { align: 'center' });
      cx += cols.madre;
      doc.line(cx, y, cx, y + rowH);
      doc.text(row.abuelos ? 'X' : '', cx + cols.abuelos / 2, y + 3.7, { align: 'center' });
      cx += cols.abuelos;
      doc.line(cx, y, cx, y + rowH);
      doc.text(row.tios ? 'X' : '', cx + cols.tios / 2, y + 3.7, { align: 'center' });
      cx += cols.tios;
      doc.line(cx, y, cx, y + rowH);
      doc.text(row.obs ?? '', cx + 2, y + 3.7);
      y += rowH;
    });

    y += 2;

    // ── SECCIÓN 2: ANTECEDENTES PERSONALES PATOLÓGICOS ────────────────────
    y = this.drawSectionHeader(doc, lm, y, pw, 'ANTECEDENTES PERSONALES PATOLÓGICOS', sectionBg, white);
    y += 0.5;

    const halfW = pw / 2 - 1;
    const ppRowH = 5;

    // Encabezados dobles
    doc.setFillColor(...lightBlue);
    doc.setDrawColor(...darkGray);
    doc.setLineWidth(0.2);
    doc.rect(lm, y, pw, ppRowH, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.setTextColor(...blue);
    ['PATOLOGÍA', 'SI', 'NO', 'PATOLOGÍA', 'SI', 'NO'].forEach((h, i) => {
      const xs = [lm + 2, lm + halfW * 0.7, lm + halfW * 0.85, lm + halfW + 4, lm + halfW + halfW * 0.7, lm + halfW + halfW * 0.85];
      doc.text(h, xs[i], y + 3.7);
    });
    doc.line(lm + halfW * 0.7 - 1, y, lm + halfW * 0.7 - 1, y + ppRowH);
    doc.line(lm + halfW * 0.85 - 1, y, lm + halfW * 0.85 - 1, y + ppRowH);
    doc.line(lm + halfW + 1, y, lm + halfW + 1, y + ppRowH);
    doc.line(lm + halfW + halfW * 0.7, y, lm + halfW + halfW * 0.7, y + ppRowH);
    doc.line(lm + halfW + halfW * 0.85, y, lm + halfW + halfW * 0.85, y + ppRowH);
    y += ppRowH;

    const ppRows: { l1: string; s1: boolean; n1: boolean; l2: string; s2: boolean; n2: boolean }[] = [
      { l1: 'DIABETES', s1: data.ppDiabetesSi, n1: data.ppDiabetesNo, l2: 'ASMA', s2: data.ppAsmaSi, n2: data.ppAsmaNo },
      { l1: 'PRESIÓN ALTA', s1: data.ppPresionAltaSi, n1: data.ppPresionAltaNo, l2: 'TUMORES', s2: data.ppTumoresSi, n2: data.ppTumoresNo },
      { l1: 'PRESIÓN BAJA', s1: data.ppPresionBajaSi, n1: data.ppPresionBajaNo, l2: 'OBESIDAD', s2: data.ppObesidadSi, n2: data.ppObesidadNo },
      { l1: 'ENFERMEDADES DEL CORAZÓN', s1: data.ppCorazonSi, n1: data.ppCorazonNo, l2: 'COLITIS', s2: data.ppColitisSi, n2: data.ppColitisNo },
      { l1: 'VARICES/INSUF.VENOSA', s1: data.ppVaricesSi, n1: data.ppVaricesNo, l2: 'GASTRITIS', s2: data.ppGastritisSi, n2: data.ppGastritisNo },
      { l1: 'CONVULSIONES', s1: data.ppConvulsionesSi, n1: data.ppConvulsionesNo, l2: 'PIEDRAS EN LA VESÍCULA', s2: data.ppVesiculaSi, n2: data.ppVesiculaNo },
      { l1: 'HEPATITIS', s1: data.ppHepatitisSi, n1: data.ppHepatitisNo, l2: 'TIROIDES', s2: data.ppTiroidesSi, n2: data.ppTiroidesNo },
      { l1: 'HERNIAS', s1: data.ppHerniasSi, n1: data.ppHerniasNo, l2: 'MIOPIA', s2: data.ppMiopiaSi, n2: data.ppMiopiaNo },
      { l1: 'ANSIEDAD / DEPRESIÓN', s1: data.ppAnsiedadSi, n1: data.ppAnsiedadNo, l2: 'ASTIGMATISMO', s2: data.ppAstigmatismoSi, n2: data.ppAstigmatismoNo },
      { l1: 'MIGRAÑA', s1: data.ppMigranasSi, n1: data.ppMigranasNo, l2: '', s2: false, n2: false },
    ];

    ppRows.forEach((row, idx) => {
      const bg: [number, number, number] = idx % 2 === 0 ? white : [242, 247, 252];
      doc.setFillColor(...bg);
      doc.setDrawColor(...darkGray);
      doc.rect(lm, y, pw, ppRowH, 'FD');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6);
      doc.setTextColor(...black);
      // Líneas verticales izquierda
      doc.line(lm + halfW * 0.7 - 1, y, lm + halfW * 0.7 - 1, y + ppRowH);
      doc.line(lm + halfW * 0.85 - 1, y, lm + halfW * 0.85 - 1, y + ppRowH);
      // Columna izquierda
      doc.text(row.l1, lm + 2, y + 3.7);
      doc.text(row.s1 ? 'X' : '', lm + halfW * 0.7 - 1 + (halfW * 0.15) / 2, y + 3.7, { align: 'center' });
      doc.text(row.n1 ? 'X' : '', lm + halfW * 0.85 - 1 + (halfW * 0.15) / 2, y + 3.7, { align: 'center' });
      // Línea divisoria central siempre visible
      doc.line(lm + halfW + 1, y, lm + halfW + 1, y + ppRowH);
      // Columna derecha (solo si hay contenido)
      if (row.l2) {
        doc.line(lm + halfW + halfW * 0.7, y, lm + halfW + halfW * 0.7, y + ppRowH);
        doc.line(lm + halfW + halfW * 0.85, y, lm + halfW + halfW * 0.85, y + ppRowH);
        doc.text(row.l2, lm + halfW + 4, y + 3.7);
        doc.text(row.s2 ? 'X' : '', lm + halfW + halfW * 0.7 + (halfW * 0.15) / 2, y + 3.7, { align: 'center' });
        doc.text(row.n2 ? 'X' : '', lm + halfW + halfW * 0.85 + (halfW * 0.15) / 2, y + 3.7, { align: 'center' });
      }
      y += ppRowH;
    });

    y += 2;

    // ── SECCIÓN 3: HÁBITOS Y ESTILO DE VIDA ───────────────────────────────
    y = this.drawSectionHeader(doc, lm, y, pw, 'HÁBITOS Y ESTILO DE VIDA', sectionBg, white);
    y += 0.5;

    const habW = { habito: 30, si: 8, no: 8, edad: 20, diario: 16, semanal: 16, mensual: 16, esporadico: 22, cantidad: pw - 30 - 8 - 8 - 20 - 16 - 16 - 16 - 22 };
    const habH = 5;

    doc.setFillColor(...lightBlue);
    doc.setDrawColor(...darkGray);
    doc.rect(lm, y, pw, habH, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.setTextColor(...blue);
    let hx = lm;
    [['HÁBITO', habW.habito], ['SI', habW.si], ['NO', habW.no], ['EDAD DE INICIO', habW.edad], ['DIARIO', habW.diario], ['SEMANAL', habW.semanal], ['MENSUAL', habW.mensual], ['ESPORÁDICO', habW.esporadico], ['CANTIDAD', habW.cantidad]].forEach(([h, w], i, arr) => {
      doc.text(h as string, (hx as number) + (w as number) / 2, y + 3.7, { align: 'center' });
      hx = (hx as number) + (w as number);
      if (i < arr.length - 1) doc.line(hx as number, y, hx as number, y + habH);
    });
    y += habH;

    const habRows = [
      { label: 'TABAQUISMO', si: data.tabSi, no: data.tabNo, edad: data.tabEdad, diario: data.tabDiario, semanal: data.tabSemanal, mensual: data.tabMensual, esporadico: data.tabEsporadico, cantidad: data.tabCantidad },
      { label: 'ALCOHOLISMO', si: data.alcSi, no: data.alcNo, edad: data.alcEdad, diario: data.alcDiario, semanal: data.alcSemanal, mensual: data.alcMensual, esporadico: data.alcEsporadico, cantidad: data.alcCantidad },
    ];

    habRows.forEach((row, idx) => {
      const bg: [number, number, number] = idx % 2 === 0 ? white : [242, 247, 252];
      doc.setFillColor(...bg);
      doc.setDrawColor(...darkGray);
      doc.rect(lm, y, pw, habH, 'FD');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6);
      doc.setTextColor(...black);
      let cx = lm;
      doc.text(row.label, cx + 2, y + 3.7);
      cx += habW.habito;
      doc.line(cx, y, cx, y + habH);
      doc.text(row.si ? 'X' : '', cx + habW.si / 2, y + 3.7, { align: 'center' });
      cx += habW.si;
      doc.line(cx, y, cx, y + habH);
      doc.text(row.no ? 'X' : '', cx + habW.no / 2, y + 3.7, { align: 'center' });
      cx += habW.no;
      doc.line(cx, y, cx, y + habH);
      doc.text(row.edad ?? '', cx + habW.edad / 2, y + 3.7, { align: 'center' });
      cx += habW.edad;
      doc.line(cx, y, cx, y + habH);
      doc.text(row.diario ? 'X' : '', cx + habW.diario / 2, y + 3.7, { align: 'center' });
      cx += habW.diario;
      doc.line(cx, y, cx, y + habH);
      doc.text(row.semanal ? 'X' : '', cx + habW.semanal / 2, y + 3.7, { align: 'center' });
      cx += habW.semanal;
      doc.line(cx, y, cx, y + habH);
      doc.text(row.mensual ? 'X' : '', cx + habW.mensual / 2, y + 3.7, { align: 'center' });
      cx += habW.mensual;
      doc.line(cx, y, cx, y + habH);
      doc.text(row.esporadico ? 'X' : '', cx + habW.esporadico / 2, y + 3.7, { align: 'center' });
      cx += habW.esporadico;
      doc.line(cx, y, cx, y + habH);
      doc.text(row.cantidad ?? '', cx + 2, y + 3.7);
      y += habH;
    });

    // Subencabezado SUSTANCIA/ALERGIA — TIPO — ESPECIFIQUE
    const subHabW = { sustancia: habW.habito + habW.si + habW.no, tipo: habW.edad + habW.diario + habW.semanal + habW.mensual, especifique: habW.esporadico + habW.cantidad };
    doc.setFillColor(...lightBlue);
    doc.setDrawColor(...darkGray);
    doc.rect(lm, y, pw, habH, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.setTextColor(...blue);
    doc.text('SUSTANCIA/ALERGIA', lm + subHabW.sustancia / 2, y + 3.7, { align: 'center' });
    doc.text('TIPO', lm + subHabW.sustancia + subHabW.tipo / 2, y + 3.7, { align: 'center' });
    doc.text('ESPECIFIQUE', lm + subHabW.sustancia + subHabW.tipo + subHabW.especifique / 2, y + 3.7, { align: 'center' });
    // Líneas divisorias verticales
    doc.setDrawColor(...darkGray);
    doc.line(lm + subHabW.sustancia, y, lm + subHabW.sustancia, y + habH);
    doc.line(lm + subHabW.sustancia + subHabW.tipo, y, lm + subHabW.sustancia + subHabW.tipo, y + habH);
    y += habH;

    // Fila DROGAS
    doc.setFillColor(...white);
    doc.setDrawColor(...darkGray);
    doc.rect(lm, y, pw, habH, 'FD');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(...black);
    doc.text('DROGAS', lm + 2, y + 3.7);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.5);
    doc.setTextColor(...darkGray);
    doc.text('TIPO:', lm + habW.habito + habW.si + habW.no + 1, y + 3.7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...black);
    doc.text('MARIHUANA / SOLVENTES / COCAÍNA', lm + habW.habito + habW.si + habW.no + 8, y + 3.7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkGray);
    doc.text('OTRA:', lm + 120, y + 3.7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...black);
    doc.text(data.droEspecifique ?? '', lm + 130, y + 3.7);
    y += habH;

    // Fila ALERGIAS
    doc.setFillColor(242, 247, 252);
    doc.setDrawColor(...darkGray);
    doc.rect(lm, y, pw, habH, 'FD');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(...black);
    doc.text('ALERGIAS', lm + 2, y + 3.7);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.5);
    doc.setTextColor(...darkGray);
    doc.text('TIPO:', lm + habW.habito + habW.si + habW.no + 1, y + 3.7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...black);
    doc.text('POLVO / PELO ANIMAL / MEDICAMENTOS', lm + habW.habito + habW.si + habW.no + 8, y + 3.7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkGray);
    doc.text('OTRA:', lm + 120, y + 3.7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...black);
    doc.text(data.aleEspecifique ?? '', lm + 130, y + 3.7);
    y += habH + 2;

    // ── SECCIÓN 4: CIRUGÍAS, LESIONES Y GINECO-OBSTÉTRICOS ────────────────
    y = this.drawSectionHeader(doc, lm, y, pw, 'CIRUGÍAS, LESIONES Y GINECO-OBSTÉTRICOS', sectionBg, white);
    y += 0.5;

    const cirW = { categoria: 40, si: 10, no: 10, detalle: pw - 40 - 10 - 10 };
    const cirH = 5;

    doc.setFillColor(...lightBlue);
    doc.setDrawColor(...darkGray);
    doc.rect(lm, y, pw, cirH, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.setTextColor(...blue);
    let cirx = lm;
    [['CATEGORÍA', cirW.categoria], ['SI', cirW.si], ['NO', cirW.no], ['DETALLE', cirW.detalle]].forEach(([h, w], i, arr) => {
      doc.text(h as string, (cirx as number) + (w as number) / 2, y + 3.7, { align: 'center' });
      cirx = (cirx as number) + (w as number);
      if (i < arr.length - 1) doc.line(cirx as number, y, cirx as number, y + cirH);
    });
    y += cirH;

    const cirRows: { label: string; si: boolean; no: boolean; detalle: string }[] = [
      { label: 'CIRUGÍAS', si: data.cirugiasSi, no: data.cirugiasNo, detalle: data.cirugiasDetalle },
      { label: 'TATUAJES', si: data.tatuajesSi, no: data.tatuajesNo, detalle: data.tatuajesDetalle },
      { label: 'PERFORACIONES', si: data.perforacionesSi, no: data.perforacionesNo, detalle: data.perforacionesDetalle },
      { label: 'ESGUINCES', si: data.esguincesSi, no: data.esguincesNo, detalle: data.esguincesDetalle },
      { label: 'LUXACIONES', si: data.luxacionesSi, no: data.luxacionesNo, detalle: data.luxacionesDetalle },
      { label: 'FRACTURAS', si: data.fracturasSi, no: data.fracturasNo, detalle: data.fracturasDetalle },
      { label: 'AMPUTACIONES', si: data.amputacionesSi, no: data.amputacionesNo, detalle: data.amputacionesDetalle },
      { label: 'PARTOS', si: data.partosSi, no: data.partosNo, detalle: data.partosDetalle },
      { label: 'CESÁREAS', si: data.cesareasSi, no: data.cesareasNo, detalle: data.cesareasDetalle },
      { label: 'ABORTOS', si: data.abortosSi, no: data.abortosNo, detalle: data.abortosDetalle },
    ];

    cirRows.forEach((row, idx) => {
      const bg: [number, number, number] = idx % 2 === 0 ? white : [242, 247, 252];
      doc.setFillColor(...bg);
      doc.setDrawColor(...darkGray);
      doc.rect(lm, y, pw, cirH, 'FD');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6);
      doc.setTextColor(...black);
      doc.text(row.label, lm + 2, y + 3.7);
      doc.line(lm + cirW.categoria, y, lm + cirW.categoria, y + cirH);
      doc.text(row.si ? 'X' : '', lm + cirW.categoria + cirW.si / 2, y + 3.7, { align: 'center' });
      doc.line(lm + cirW.categoria + cirW.si, y, lm + cirW.categoria + cirW.si, y + cirH);
      doc.text(row.no ? 'X' : '', lm + cirW.categoria + cirW.si + cirW.no / 2, y + 3.7, { align: 'center' });
      doc.line(lm + cirW.categoria + cirW.si + cirW.no, y, lm + cirW.categoria + cirW.si + cirW.no, y + cirH);
      doc.text(row.detalle ?? '', lm + cirW.categoria + cirW.si + cirW.no + 3, y + 3.7);
      y += cirH;
    });

    y += 7;

    // ── Declaración y firma ────────────────────────────────────────────────
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7);
    doc.setTextColor(...darkGray);
    const declaracion = 'Declaro que todo lo anteriormente expuesto es verdad y autorizo su confirmación';
    doc.text(declaracion, lm + pw / 2, y, { align: 'center' });

    y += 6;

    // Línea de firma
    const sigW = 70;
    const sigX = lm + pw / 2 - sigW / 2;
    doc.setDrawColor(...darkGray);
    doc.setLineWidth(0.3);
    doc.line(sigX, y, sigX + sigW, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...darkGray);
    doc.text('Firma del solicitante', sigX + sigW / 2, y + 4, { align: 'center' });
  }

  private drawSectionHeader(doc: jsPDF, x: number, y: number, w: number, title: string, bg: [number, number, number], textColor: [number, number, number]): number {
    doc.setFillColor(...bg);
    doc.setDrawColor(...bg);
    doc.rect(x, y, w, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...textColor);
    doc.text(title, x + w / 2, y + 4.2, { align: 'center' });
    return y + 6;
  }

  private drawLabelField(
    doc: jsPDF, x: number, y: number, w: number, h: number,
    label: string, value: string,
    labelColor: [number, number, number], bg: [number, number, number],
    valueColor: [number, number, number], borderColor: [number, number, number]
  ): void {
    doc.setFillColor(...bg);
    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.2);
    doc.rect(x, y, w, h, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(...labelColor);
    doc.text(label, x + 2, y + 4.2);
    const labelWidth = doc.getTextWidth(label) + 3;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...valueColor);
    doc.text(value ?? '', x + labelWidth + 1, y + 4.2);
  }

  private drawCheckbox(doc: jsPDF, x: number, y: number, size: number, checked: boolean, borderColor: [number, number, number], checkColor: [number, number, number]): void {
    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.2);
    doc.setFillColor(255, 255, 255);
    doc.rect(x, y, size, size, 'FD');
    if (checked) {
      doc.setDrawColor(...checkColor);
      doc.setLineWidth(0.5);
      doc.line(x + 0.5, y + 0.5, x + size - 0.5, y + size - 0.5);
      doc.line(x + size - 0.5, y + 0.5, x + 0.5, y + size - 0.5);
    }
  }
}
