import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';

export interface EvaluacionDesempenoData {
  nombreEmpleado: string;
  fechaIngreso: string;
  nombreJefe: string;
  puestoEmpleado: string;

  // Calidad en el trabajo
  eficacia: number;
  eficiencia: number;
  orden: number;
  limpieza: number;

  // Cooperación y Actitud
  asistenciaPuntualidad: number;
  disciplina: number;
  disponibilidad: number;
  responsabilidad: number;
  profesionalismo: number;

  // Iniciativa
  innovacion: number;
  discernimiento: number;
  espirituEmpresa: number;

  // Relaciones Interpersonales
  comunicacion: number;
  respeto: number;

  // Trabajo en equipo
  liderazgo: number;
  espirituColaboracion: number;

  // Lealtad Institucional
  compromiso: number;
  sentidoPertenencia: number;

  // Comentarios por factor
  comentarioEficacia: string;
  comentarioEficiencia: string;
  comentarioOrden: string;
  comentarioLimpieza: string;
  comentarioAsistenciaPuntualidad: string;
  comentarioDisciplina: string;
  comentarioDisponibilidad: string;
  comentarioResponsabilidad: string;
  comentarioProfesionalismo: string;
  comentarioInnovacion: string;
  comentarioDiscernimiento: string;
  comentarioEspirituEmpresa: string;
  comentarioComunicacion: string;
  comentarioRespeto: string;
  comentarioLiderazgo: string;
  comentarioEspirituColaboracion: string;
  comentarioCompromiso: string;
  comentarioSentidoPertenencia: string;

  // Compromisos y acuerdos
  acuerdos: string;
}

// Estructura interna de cada grupo objetivo → factores → 3 parámetros
interface FactorDef {
  nombre: string;
  descripcion: string;
  parametros: [string, string, string];
  valor: number;
  comentario: string;
}

interface ObjetivoDef {
  nombre: string;
  factores: FactorDef[];
}

@Injectable({ providedIn: 'root' })
export class ReportEvaluacionDesempenoService {

  async generate(data: EvaluacionDesempenoData): Promise<void> {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
    const logoBase64 = await this.loadLogoBase64();
    this.drawPage(doc, data, logoBase64);
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    doc.save(`EvaluacionDesempeno_${today}.pdf`);
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

  private buildObjetivos(data: EvaluacionDesempenoData): ObjetivoDef[] {
    return [
      {
        nombre: 'Calidad en el trabajo',
        factores: [
          {
            nombre: 'Eficacia',
            descripcion: 'Alcanza los resultados que de acuerdo a su puesto espera la organización',
            parametros: [
              'Pocas veces cumple el objetivo',
              'Cumple las tareas encomendadas pero no llega al resultado esperado',
              'Las tareas encomendadas  las realiza cumpliendo con el objetivo y a menor costo',
            ],
            valor: Number(data.eficacia) || 0,
            comentario: data.comentarioEficacia || '',
          },
          {
            nombre: 'Eficiencia',
            descripcion: 'Realiza su trabajo con  exactitud',
            parametros: [
              'Pocas veces cumple con la totalidad del trabajo',
              'Cumple con la totalidad del trabajo, pero fuera del tiempo previsto',
              'Realiza su trabajo con exactitud y en el tiempo previsto',
            ],
            valor: Number(data.eficiencia) || 0,
            comentario: data.comentarioEficiencia || '',
          },
          {
            nombre: 'Orden',
            descripcion: 'Muestra orden y organización en sus actividades y lugar de trabajo',
            parametros: [
              'Trata de ser ordenado pero no lo logra',
              'Normalmente es Ordenado',
              'Demuestra el orden y organización en la realización de sus funciones y en su lugar de trabajo',
            ],
            valor: Number(data.orden) || 0,
            comentario: data.comentarioOrden || '',
          },
          {
            nombre: 'Limpieza',
            descripcion: 'Demuestra ser una persona con buenos hábitos de limpieza tanto en su persona como en el trabajo que realiza',
            parametros: [
              'Algunas veces',
              'Regularmente',
              'Proyecta pulcritud en su persona y en los trabajos que realiza',
            ],
            valor: Number(data.limpieza) || 0,
            comentario: data.comentarioLimpieza || '',
          },
        ],
      },
      {
        nombre: 'Cooperación y Actitud',
        factores: [
          {
            nombre: 'Asistencia y Puntualidad',
            descripcion: 'Desarrollado en relación con los funciones definidos para el puesto, así como la observancia de la jornada completa de trabajo',
            parametros: [
              'Asiste regularmente y casi siempre es puntual',
              'No falta pero a veces se presenta o inicia sus labores después de la hora establecida',
              'Es puntual, no falta y cumple totalmente con la jornada de trabajo',
            ],
            valor: Number(data.asistenciaPuntualidad) || 0,
            comentario: data.comentarioAsistenciaPuntualidad || '',
          },
          {
            nombre: 'Disciplina',
            descripcion: 'Observa perfectamente las normas que establece la compañía, así como las propias de su actividad',
            parametros: [
              'Insuficiente',
              'Regularmente',
              'Acata las normas, procura y/o asegura que los demás lo hagan',
            ],
            valor: Number(data.disciplina) || 0,
            comentario: data.comentarioDisciplina || '',
          },
          {
            nombre: 'Disponibilidad',
            descripcion: 'Muestra disposición hacia todo lo que se le encomienda, independientemente de sus funciones específicas',
            parametros: [
              'Realiza solamente las funciones encomendadas',
              'Muestra disposición algunas veces',
              'Siempre muestra disponibilidad  independientemente de las funciones que ya tiene encomendadas',
            ],
            valor: Number(data.disponibilidad) || 0,
            comentario: data.comentarioDisponibilidad || '',
          },
          {
            nombre: 'Responsabilidad',
            descripcion: 'Responde por los resultados de las  tareas que le son encomendadas',
            parametros: [
              'No asume completamente su responsabilidad',
              'Asume su responsabilidad la mayoría de las veces',
              'Responde  plena y totalmente por los resultados de lo encomendado',
            ],
            valor: Number(data.responsabilidad) || 0,
            comentario: data.comentarioResponsabilidad || '',
          },
          {
            nombre: 'Profesionalismo',
            descripcion: 'Perfecto conocimiento de las reglas y conceptos: Ética, integridad y honestidad',
            parametros: [
              'Muestra honestidad en sus actividades',
              'Cuenta con valores firmes en cuanto a ética profesional',
              'Muestra un total apego a la ética, integridad y honestidad en el desarrollo de sus funciones dentro de la organización',
            ],
            valor: Number(data.profesionalismo) || 0,
            comentario: data.comentarioProfesionalismo || '',
          },
        ],
      },
      {
        nombre: 'Iniciativa',
        factores: [
          {
            nombre: 'Innovación',
            descripcion: 'Propone nuevas ideas y soluciones y busca nuevas formas de hacer su trabajo',
            parametros: [
              'Muestra poco interés en proponer nuevas ideas',
              'En ocasiones  propone soluciones',
              'Constantemente busca nuevas y mejores formas de desempeño',
            ],
            valor: Number(data.innovacion) || 0,
            comentario: data.comentarioInnovacion || '',
          },
          {
            nombre: 'Discernimiento',
            descripcion: 'Analiza las situaciones con criterio y sentido común. Toma decisiones claras y fundamentadas',
            parametros: [
              'Solamente sigue instrucciones',
              'Analiza y acata instrucciones',
              'Toma decisiones claras y fundamentadas con respecto a problemas dados.',
            ],
            valor: Number(data.discernimiento) || 0,
            comentario: data.comentarioDiscernimiento || '',
          },
          {
            nombre: 'Espíritu de empresa',
            descripcion: 'Muestra deseo de emprender proyectos, toma riesgos, desarrolla y se hace cargo de proyectos',
            parametros: [
              'Tiene facilidad para emprender las tareas con originalidad',
              'Normalmente emprende tareas propuestas por él',
              'Desarrolla, se hace cargo de proyectos y toma riesgos calculados',
            ],
            valor: Number(data.espirituEmpresa) || 0,
            comentario: data.comentarioEspirituEmpresa || '',
          },
        ],
      },
      {
        nombre: 'Relaciones Interpersonales',
        factores: [
          {
            nombre: 'Comunicación',
            descripcion: 'Expresa sus ideas de manera lógica y coherente. Tiene habilidad para relacionarse con los demás',
            parametros: [
              'Muestra poco interés para relacionarse con los demás',
              'Tiene muy buenas relaciones con los demás, sin embargo  no alcanza los objetivos de equipo',
              'Tiene la habilidad de comunicarse con los demás para lograr metas comunes en beneficio de la organización',
            ],
            valor: Number(data.comunicacion) || 0,
            comentario: data.comentarioComunicacion || '',
          },
          {
            nombre: 'Respeto',
            descripcion: 'Muestra claramente el respeto a sus semejantes',
            parametros: [
              'Casi siempre muestra respeto hacia  los demás',
              'Siempre es respetuoso con los demás',
              'Tiene perfecto conocimiento de lo que es el respeto a las personas, tiempo y lugar.',
            ],
            valor: Number(data.respeto) || 0,
            comentario: data.comentarioRespeto || '',
          },
        ],
      },
      {
        nombre: 'Trabajo en equipo',
        factores: [
          {
            nombre: 'Liderazgo',
            descripcion: 'Capacidad para influir y promover el desarrollo de su personal en armonía',
            parametros: [
              'Necesita supervisión directa en el desempeño de sus labores',
              'Se integra con facilidad en los equipos de trabajo',
              'Es capaz de influir y promover el desarrollo del personal',
            ],
            valor: Number(data.liderazgo) || 0,
            comentario: data.comentarioLiderazgo || '',
          },
          {
            nombre: 'Espíritu de colaboración',
            descripcion: 'Contribuye a lograr los objetivos de trabajo con respeto y cooperación',
            parametros: [
              'Prefiere trabajar solo',
              'Trabaja en equipo pero no se involucra al grado de lograr los objetivos del equipo',
              'Contribuye a lograr los objetivos de trabajo, con respeto y espíritu de colaboración',
            ],
            valor: Number(data.espirituColaboracion) || 0,
            comentario: data.comentarioEspirituColaboracion || '',
          },
        ],
      },
      {
        nombre: 'Lealtad Institucional',
        factores: [
          {
            nombre: 'Compromiso',
            descripcion: 'Actúa conforme a la normatividad y promueve los valores de la organización',
            parametros: [
              'Asume el compromiso por que no tiene otra alternativa',
              'Asume sus compromisos con responsabilidad',
              'Asume plenamente la responsabilidad y tiene la firme convicción de cumplir y hacer cumplir la misión',
            ],
            valor: Number(data.compromiso) || 0,
            comentario: data.comentarioCompromiso || '',
          },
          {
            nombre: 'Sentido de Pertenencia',
            descripcion: 'Demuestra una actitud positiva hacia la organización y muestra satisfacción por pertenecer a ella',
            parametros: [
              'Está en la empresa sólo por que necesita el trabajo',
              'Le agrada trabajar en la organización por desarrollarse  profesionalmente',
              'Demuestra su satisfacción de pertenecer a la empresa y vive los valores de la organización plenamente',
            ],
            valor: Number(data.sentidoPertenencia) || 0,
            comentario: data.comentarioSentidoPertenencia || '',
          },
        ],
      },
    ];
  }

  private drawPage(doc: jsPDF, data: EvaluacionDesempenoData, logo: string | null): void {
    const lm = 8;           // margen izquierdo
    const pw = 195;         // ancho total de la tabla
    const black: [number, number, number] = [0, 0, 0];
    const white: [number, number, number] = [255, 255, 255];
    const darkBlue: [number, number, number] = [0, 32, 96];

    const factorBg: [number, number, number] = [0, 0, 0];       // negro para fila de factor
    const gray1: [number, number, number] = [242, 242, 242];
    const borderColor: [number, number, number] = [150, 150, 150];

    // ── Anchos de columna ──────────────────────────────────────────────────
    const cObj   = 22;
    const cFact  = 40;
    const cParam = 70;
    const cVp    = 16;
    const cVa    = 16;
    const cCom   = pw - cObj - cFact - cParam - cVp - cVa;  // ~31

    let y = 6;

    // ── ENCABEZADO ─────────────────────────────────────────────────────────
    // Logo a la izquierda
    if (logo) {
      doc.addImage(logo, 'PNG', lm, y, 16, 16);
    }

    // Empresa + título centrados sin marcos
    const titleX = lm + 18;
    const titleW = pw - 18;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...black);
    doc.text('INTEC DE JALISCO SA DE C.V.', titleX + titleW / 2, y + 5, { align: 'center' });

    doc.setFontSize(11);
    doc.text('EVALUACIÓN DEL DESEMPEÑO', titleX + titleW / 2, y + 12, { align: 'center' });

    // Calcular fecha una sola vez para usar en Compromiso
    const today = new Date();
    const fechaStr = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;

    y += 18;

    // ── DATOS DEL EMPLEADO ─────────────────────────────────────────────────
    // Fila 1: NOMBRE DEL EMPLEADO | FECHA DE INGRESO DEL EMPLEADO
    const halfW = pw / 2;
    this.drawDataRow(doc, lm, y, halfW, 8, 'NOMBRE DEL EMPLEADO', data.nombreEmpleado, borderColor, black);
    this.drawDataRow(doc, lm + halfW, y, halfW, 8, 'FECHA DE INGRESO DEL EMPLEADO', data.fechaIngreso, borderColor, black);
    y += 8;

    // Fila 2: NOMBRE DEL JEFE INMEDIATO | PUESTO DEL EMPLEADO
    this.drawDataRow(doc, lm, y, halfW, 8, 'NOMBRE DEL JEFE INMEDIATO', data.nombreJefe, borderColor, black);
    this.drawDataRow(doc, lm + halfW, y, halfW, 8, 'PUESTO DEL EMPLEADO', data.puestoEmpleado, borderColor, black);
    y += 8;

    // ── INSTRUCCIONES ──────────────────────────────────────────────────────
    const instrRows: { text: string; bold: boolean; color: [number, number, number] }[] = [
      { text: 'Este formato deberá utilizarse para la evaluación de empleados a quienes se les termina el contrato inicial de prueba', bold: true, color: black },
      { text: 'Lea cuidadosamente cada uno de los objetivos, factores y parámetros para calificar el  desempeño del personal a su cargo y seleccione únicamente una calificación para cada parámetro. Sume los puntos y anote el resultado.', bold: false, color: [200, 0, 0] },
      { text: 'Toda calificación deberá ser soportada con el comentario  correspondiente.', bold: false, color: [200, 0, 0] },
    ];

    instrRows.forEach(row => {
      const lines = doc.splitTextToSize(row.text, pw - 4);
      const h = Math.max(6, lines.length * 3.8 + 2);
      doc.setFillColor(...white);
      doc.setDrawColor(...borderColor);
      doc.setLineWidth(0.3);
      doc.rect(lm, y, pw, h, 'FD');
      doc.setFont('helvetica', row.bold ? 'bold' : 'normal');
      doc.setFontSize(7);
      doc.setTextColor(...row.color);
      doc.text(lines, lm + pw / 2, y + 4, { align: 'center' });
      y += h;
    });

    // ── ENCABEZADO DE TABLA ────────────────────────────────────────────────
    const thH = 10;
    doc.setFillColor(...gray1);
    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.3);
    doc.rect(lm, y, pw, thH, 'FD');

    // Líneas verticales del encabezado
    let xLine = lm + cObj;
    [cFact, cParam, cVp, cVa, cCom].forEach(w => {
      doc.line(xLine, y, xLine, y + thH);
      xLine += w;
    });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...black);
    const thCols = [
      { label: 'Objetivo', w: cObj },
      { label: 'Factor', w: cFact },
      { label: 'Parámetro', w: cParam },
      { label: 'Valor en\npunto', w: cVp },
      { label: 'Valor\nasigna\ndo', w: cVa },
      { label: 'Comentarios\npara el soporte\nde la calificación', w: cCom },
    ];
    let xTh = lm;
    thCols.forEach(col => {
      const lines = col.label.split('\n');
      const startY = y + (thH - lines.length * 3) / 2 + 2.5;
      lines.forEach((line, i) => {
        doc.text(line, xTh + col.w / 2, startY + i * 3, { align: 'center' });
      });
      xTh += col.w;
    });
    y += thH;

    // ── FILAS DE DATOS ─────────────────────────────────────────────────────
    const objetivos = this.buildObjetivos(data);
    const fs = 6.5;          // font size filas
    const lineH = 3.4;       // alto de una línea de texto a fs 6.5
    const padV = 2.5;        // padding vertical interno
    const pageH = 270;       // límite inferior de página (letter ~279, margen inferior)
    const marginTop = 12;    // y inicial en página nueva (debajo del encabezado repetido)

    // Calcula la altura necesaria de una fila de parámetro
    const calcRowH = (text: string): number => {
      doc.setFontSize(fs);
      const lines = doc.splitTextToSize(text, cParam - 2);
      return Math.max(lines.length * lineH + padV * 2, 6);
    };

    // Calcula altura de la fila negra del factor
    const factorRowH = 5.5;


    // Agrega nueva página y reinicia y
    const addPage = (): void => {
      doc.addPage();
      y = marginTop;
    };

    // Helper: dibuja la celda del objetivo en un segmento de página
    const drawObjCell = (segObjY: number, segH: number, nombre: string): void => {
      doc.setFillColor(...white);
      doc.setDrawColor(...borderColor);
      doc.setLineWidth(0.3);
      doc.rect(lm, segObjY, cObj, segH, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(fs);
      doc.setTextColor(...black);
      const objLines = doc.splitTextToSize(nombre, cObj - 2);
      const objTextH = objLines.length * lineH;
      const objTextY = segObjY + (segH - objTextH) / 2 + lineH;
      doc.text(objLines, lm + cObj / 2, objTextY, { align: 'center' });
    };

    objetivos.forEach(obj => {
      // Pre-calcular alturas de todas las filas del objetivo
      const factHeights: { factorH: number; paramHs: number[]; totalH: number }[] = obj.factores.map(factor => {
        const paramHs = factor.parametros.map(p => calcRowH(p));
        const totalH = paramHs.reduce((a, b) => a + b, 0);
        return { factorH: totalH, paramHs, totalH };
      });

      // Rastrear segmentos del objetivo por página
      let segStartY = y;

      obj.factores.forEach((factor, fi) => {
        const fh = factHeights[fi];

        // Salto de página por factor: si el factor completo no cabe, nueva página
        if (y + fh.totalH > pageH) {
          // Cerrar segmento actual antes de saltar
          const segH = y - segStartY;
          if (segH > 0) drawObjCell(segStartY, segH, obj.nombre);
          addPage();
          segStartY = y;
        }

        const factY = y;

        factor.parametros.forEach((param, pi) => {
          const rH = fh.paramHs[pi];
          const isSelected = factor.valor === (pi + 1);

          const actualY = y;

          // Fondo fila
          doc.setFillColor(...white);
          doc.setDrawColor(...borderColor);
          doc.setLineWidth(0.2);
          doc.rect(lm, actualY, pw, rH, 'FD');

          // Texto parámetro
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(fs);
          doc.setTextColor(...black);
          const pLines = doc.splitTextToSize(param, cParam - 2);
          doc.text(pLines, lm + cObj + cFact + 1, actualY + padV + lineH - 0.5);

          // Líneas verticales separadoras
          doc.setDrawColor(...borderColor);
          doc.setLineWidth(0.2);
          const x1 = lm + cObj + cFact + cParam;
          const x2 = x1 + cVp;
          const x3 = x2 + cVa;
          doc.line(x1, actualY, x1, actualY + rH);
          doc.line(x2, actualY, x2, actualY + rH);
          doc.line(x3, actualY, x3, actualY + rH);

          // Valor en puntos (centrado verticalmente)
          doc.setTextColor(...black);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7);
          doc.text(String(pi + 1), x1 + cVp / 2, actualY + rH / 2 + 1.5, { align: 'center' });

          // Valor asignado
          if (isSelected) {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8);
            doc.setTextColor(...darkBlue);
            doc.text(String(pi + 1), x2 + cVa / 2, actualY + rH / 2 + 1.5, { align: 'center' });
          }

          // Comentario: se dibuja solo en la primera fila del factor, abarcando toda la altura
          if (pi === 0 && factor.comentario) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(fs);
            doc.setTextColor(...black);
            const comLines = doc.splitTextToSize(factor.comentario, cCom - 2);
            doc.text(comLines, x3 + 1, actualY + padV + lineH - 0.5);
          }

          y += rH;
        });

        // Dibujar celda del factor encima (fila negra = nombre, resto = descripción)
        doc.setFillColor(...factorBg);
        doc.setDrawColor(...borderColor);
        doc.setLineWidth(0.2);
        doc.rect(lm + cObj, factY, cFact, factorRowH, 'FD');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(fs);
        doc.setTextColor(...white);
        doc.text(factor.nombre, lm + cObj + cFact / 2, factY + factorRowH / 2 + 1.5, { align: 'center' });

        // Descripción del factor (resto de la celda)
        const descAreaH = fh.totalH - factorRowH;
        if (descAreaH > 0) {
          doc.setFillColor(...white);
          doc.rect(lm + cObj, factY + factorRowH, cFact, descAreaH, 'F');
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(6.5);
          doc.setTextColor(...black);
          const descLines = doc.splitTextToSize(factor.descripcion, cFact - 2);
          doc.text(descLines, lm + cObj + 1, factY + factorRowH + 3);
        }

        // Borde exterior del factor
        doc.setDrawColor(...borderColor);
        doc.setLineWidth(0.2);
        doc.rect(lm + cObj, factY, cFact, fh.totalH, 'D');
      });

      // Dibujar celda del objetivo para el último (o único) segmento
      const finalSegH = y - segStartY;
      if (finalSegH > 0) drawObjCell(segStartY, finalSegH, obj.nombre);
    });

    // ── RESULTADOS ────────────────────────────────────────────────────────
    // Columnas alineadas con la tabla principal:
    // [Resultados] | [Actuación header spanning Promedio+%+Vp+Va+Com]
    //              | [Promedio...] | [% filas] | [Vp vacío] | [Va vacío] | [Com vacío]
    const resLabelW = cObj;           // alineado con columna Objetivo
    const resPromW  = cFact;          // alineado con columna Factor
    const resPctW   = cParam;         // alineado con columna Parámetro
    const resActH   = 7;
    const resRowH   = 8;
    const resTotalH = 3 * resRowH;
    const resBlockH = resActH + resTotalH;
    const resStartY = y;

    // 1. Fila "Actuación" — abarca desde resLabelW hasta el final
    doc.setFillColor(...white);
    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.3);
    doc.rect(lm + resLabelW, resStartY, pw - resLabelW, resActH, 'FD');
    // línea vertical para separar Promedio | % | Vp | Va | Com en encabezado
    doc.setDrawColor(...borderColor);
    doc.line(lm + resLabelW + resPromW, resStartY, lm + resLabelW + resPromW, resStartY + resActH);
    doc.line(lm + resLabelW + resPromW + resPctW, resStartY, lm + resLabelW + resPromW + resPctW, resStartY + resActH);
    doc.line(lm + resLabelW + resPromW + resPctW + cVp, resStartY, lm + resLabelW + resPromW + resPctW + cVp, resStartY + resActH);
    doc.line(lm + resLabelW + resPromW + resPctW + cVp + cVa, resStartY, lm + resLabelW + resPromW + resPctW + cVp + cVa, resStartY + resActH);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...black);
    // Centrar "Actuación" solo sobre las columnas Promedio + %
    doc.text('Actuación', lm + resLabelW + (resPromW + resPctW) / 2, resStartY + resActH / 2 + 1.5, { align: 'center' });

    const resContentY = resStartY + resActH;

    // 2. Celda "Promedio..." (izquierda del contenido, alineada con Factor)
    doc.setFillColor(...white);
    doc.setDrawColor(...borderColor);
    doc.rect(lm + resLabelW, resContentY, resPromW, resTotalH, 'FD');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...black);
    const promText = 'Promedio de los objetivos obtenidos en los últimos dos trimestres anteriores';
    const promLines = doc.splitTextToSize(promText, resPromW - 3);
    const promTextH = promLines.length * 3.5;
    doc.text(promLines, lm + resLabelW + 2, resContentY + (resTotalH - promTextH) / 2 + 3.5);

    // ── Calcular total antes de dibujar resultados ─────────────────────────
    const total = [
      data.eficacia, data.eficiencia, data.orden, data.limpieza,
      data.asistenciaPuntualidad, data.disciplina, data.disponibilidad,
      data.responsabilidad, data.profesionalismo,
      data.innovacion, data.discernimiento, data.espirituEmpresa,
      data.comunicacion, data.respeto,
      data.liderazgo, data.espirituColaboracion,
      data.compromiso, data.sentidoPertenencia,
    ].reduce((a, b) => a + (Number(b) || 0), 0);

    const pct = total / 54 * 100;
    const resultadoIdx = pct <= 80 ? 0 : pct <= 90 ? 1 : 2;

    // 3. Sub-filas de porcentajes (alineadas con columna Parámetro)
    const resRows = [
      'Hasta 80 % de cumplimiento',
      'De 81 a 90% de cumplimiento',
      'De 91 A 100 % de cumplimiento',
    ];
    const resExtraX = lm + resLabelW + resPromW + resPctW;
    resRows.forEach((txt, i) => {
      const ry = resContentY + i * resRowH;
      doc.setFillColor(...white);
      doc.setDrawColor(...borderColor);
      // Celda porcentaje
      doc.rect(lm + resLabelW + resPromW, ry, resPctW, resRowH, 'FD');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(...black);
      doc.text(txt, lm + resLabelW + resPromW + 2, ry + resRowH / 2 + 1.5);
      // Celdas Vp, Va, Com por fila — fondo blanco explícito
      doc.setFillColor(...white);
      doc.rect(resExtraX,              ry, cVp,  resRowH, 'FD');
      doc.setFillColor(...white);
      doc.rect(resExtraX + cVp,        ry, cVa,  resRowH, 'FD');
      doc.setFillColor(...white);
      doc.rect(resExtraX + cVp + cVa,  ry, cCom, resRowH, 'FD');
      // X en la celda Va de la fila que corresponde al resultado
      if (i === resultadoIdx) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(200, 0, 0);
        doc.text('X', resExtraX + cVp + cVa / 2, ry + resRowH / 2 + 1.5, { align: 'center' });
      }
    });

    // 5. Celda "Resultados" (merged, dibujada al final para tapar bordes internos)
    doc.setFillColor(...white);
    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.3);
    doc.rect(lm, resStartY, resLabelW, resBlockH, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...black);
    doc.text('Resultados', lm + resLabelW / 2, resStartY + resBlockH / 2 + 1.5, { align: 'center' });

    y = resStartY + resBlockH;

    // ── TOTAL DE PUNTOS ────────────────────────────────────────────────────

    const totalH = 7;
    const totalValX = lm + cObj + cFact + cParam;

    // Fondo gris para toda la fila
    doc.setFillColor(...gray1);
    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.3);
    doc.rect(lm, y, pw, totalH, 'FD');

    // Texto "TOTAL DE PUNTOS" a la izquierda
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...black);
    doc.text('TOTAL DE PUNTOS', lm + 2, y + 4.8);

    // Celda Vp: blanca vacía
    doc.setFillColor(...white);
    doc.setDrawColor(...borderColor);
    doc.rect(totalValX, y, cVp, totalH, 'FD');

    // Celda Va: blanca con el total en rojo
    doc.setFillColor(...white);
    doc.setDrawColor(...borderColor);
    doc.rect(totalValX + cVp, y, cVa, totalH, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(200, 0, 0);
    doc.text(String(total), totalValX + cVp + cVa / 2, y + 5, { align: 'center' });

    // Celda Com: "Puntuación" solamente
    doc.setFillColor(...gray1);
    doc.setDrawColor(...borderColor);
    doc.rect(totalValX + cVp + cVa, y, cCom, totalH, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...black);
    doc.text('Puntuación', totalValX + cVp + cVa + 2, y + 4.8);
    y += totalH;

    // ── TABLA DE RANGOS ────────────────────────────────────────────────────
    // Encabezado: [texto largo] | [Máxima 54 (mitad motivos)] | [Mínima 18 (mitad motivos)]
    // Filas:      # | Clasificación | Signo | [vacío] | Rango | Motivos
    const tW0 = 10;   // #
    const tW1 = 35;   // Clasificación
    const tW2 = 22;   // Signo
    const tW3 = 15;   // vacío
    const tW4 = 22;   // Rango
    const tW5 = pw - tW0 - tW1 - tW2 - tW3 - tW4; // Motivos (~91)
    const tRH = 7;
    const tTitleH = 9;

    const tX0 = lm;
    const tX1 = tX0 + tW0;   // Clasificación
    const tX2 = tX1 + tW1;   // Signo
    const tX3 = tX2 + tW2;   // vacío
    const tX4 = tX3 + tW3;   // Rango
    const tX5 = tX4 + tW4;   // Motivos

    // Ancho zona texto largo = todo menos Motivos
    const tLeftW = tW0 + tW1 + tW2 + tW3 + tW4;
    const tHalfMot = tW5 / 2; // mitad de Motivos

    // ── Encabezado ──
    // Celda texto largo (gris)
    doc.setFillColor(...gray1);
    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.3);
    doc.rect(lm, y, tLeftW, tTitleH, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.setTextColor(...black);
    doc.text(
      ['MARQUE CON UNA (X) EL RANGO EN QUE', 'SE UBICA LA CALIFICACION OBTENIDA'],
      lm + tLeftW / 2, y + 3.5, { align: 'center' }
    );

    // Celda "Máxima 54" (primera mitad de Motivos)
    doc.setFillColor(...white);
    doc.rect(tX5, y, tHalfMot, tTitleH, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.setTextColor(...black);
    doc.text(['Máxima', '54'], tX5 + tHalfMot / 2, y + 3.2, { align: 'center' });

    // Celda "Mínima 18" (segunda mitad de Motivos)
    doc.setFillColor(...white);
    doc.rect(tX5 + tHalfMot, y, tHalfMot, tTitleH, 'FD');
    doc.text(['Mínima', '18'], tX5 + tHalfMot + tHalfMot / 2, y + 3.2, { align: 'center' });

    y += tTitleH;

    // ── Filas de datos ──
    const rangos = [
      { num: 1, clasificacion: 'INADECUADO',    signo: 'A',    accion: 'DESVINCULACION',                           rango: '18 A 27' },
      { num: 2, clasificacion: 'PUEDE MEJORAR', signo: 'A',    accion: '2o PERIODO DE PRUEBA',                     rango: '28 A 37' },
      { num: 3, clasificacion: 'SATISFACTORIO', signo: 'AA',   accion: 'CONTRATO X TIEMPO INDETERMINADO (PLANTA)', rango: '38 A 43' },
      { num: 4, clasificacion: 'MUY BUENO',     signo: 'AAA',  accion: 'CONTRATO X TIEMPO INDETERMINADO (PLANTA)', rango: '44 A 48' },
      { num: 5, clasificacion: 'EXCELENTE',     signo: 'AAAA', accion: 'CONTRATO X TIEMPO INDETERMINADO (PLANTA)', rango: '49 A 54' },
    ];

    rangos.forEach((r) => {
      const lo = parseInt(r.rango.split(' ')[0], 10);
      const hi = parseInt(r.rango.split(' ')[2], 10);
      const inRange = total >= lo && total <= hi;
      const bg: [number, number, number] = inRange ? [198, 224, 180] : white;

      doc.setFontSize(6.5);
      const aLines = doc.splitTextToSize(r.accion, tW5 - 3);
      const rowH = Math.max(tRH, aLines.length * 3.5 + 3);

      // 6 columnas en las filas: #, Clasificación, Signo, vacío, Rango, Motivos
      const cells: { x: number; w: number; val: string; wrap?: boolean }[] = [
        { x: tX0, w: tW0, val: String(r.num) },
        { x: tX1, w: tW1, val: r.clasificacion },
        { x: tX2, w: tW2, val: r.signo },
        { x: tX3, w: tW3, val: '' },
        { x: tX4, w: tW4, val: r.rango },
        { x: tX5, w: tW5, val: r.accion, wrap: true },
      ];

      cells.forEach(cell => {
        doc.setFillColor(...bg);
        doc.setDrawColor(...borderColor);
        doc.setLineWidth(0.2);
        doc.rect(cell.x, y, cell.w, rowH, 'FD');
        doc.setFont('helvetica', inRange ? 'bold' : 'normal');
        doc.setFontSize(6.5);
        doc.setTextColor(...black);
        if (cell.wrap) {
          const wLines = doc.splitTextToSize(cell.val, cell.w - 3);
          const wH = wLines.length * 3.5;
          doc.text(wLines, cell.x + cell.w / 2, y + (rowH - wH) / 2 + 3, { align: 'center' });
        } else {
          doc.text(cell.val, cell.x + cell.w / 2, y + rowH / 2 + 1.5, { align: 'center' });
        }
        // Palomita en columna vacía de la fila que corresponde al puntaje
        if (inRange && cell.x === tX3) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          doc.setTextColor(0, 100, 0);
          doc.text('X', cell.x + cell.w / 2, y + rowH / 2 + 1.5, { align: 'center' });
        }
      });

      y += rowH;
    });

    y += 3;

    // ── COMPROMISOS ────────────────────────────────────────────────────────
    doc.setFontSize(7);
    const acuerdosLines = data.acuerdos
      ? doc.splitTextToSize(data.acuerdos, pw - 6)
      : [''];
    const compTitleH = Math.max(12, acuerdosLines.length * 3.8 + 8);
    doc.setFillColor(...white);
    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.3);
    doc.rect(lm, y, pw, compTitleH, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...black);
    doc.text('COMPROMISO:', lm + 2, y + 4.5);
    // Fecha en esquina superior derecha de la celda
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text('Fecha:', lm + pw - 28, y + 4.5);
    doc.setFont('helvetica', 'normal');
    doc.text(fechaStr, lm + pw - 14, y + 4.5);
    if (data.acuerdos) {
      doc.setFont('helvetica', 'normal');
      doc.text(acuerdosLines, lm + 28, y + 4.5);
    }
    y += compTitleH;

    // ── FIRMAS ─────────────────────────────────────────────────────────────
    const firmaH = 20;
    const fw = pw / 3;
    const firmas = ['FIRMA DEL JEFE INMEDIATO', 'FIRMA DE R.H.', 'TRABAJADOR:'];
    doc.setFillColor(...white);
    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.3);
    doc.rect(lm, y, pw, firmaH, 'FD');

    firmas.forEach((label, i) => {
      const fx = lm + i * fw;
      if (i > 0) doc.line(fx, y, fx, y + firmaH);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(...black);
      doc.text(label, fx + fw / 2, y + 4.5, { align: 'center' });
      // Línea de firma
      doc.setDrawColor(100, 100, 100);
      doc.setLineWidth(0.3);
      doc.line(fx + 5, y + 15, fx + fw - 5, y + 15);
    });
  }

  /** Dibuja una celda con etiqueta en negrita arriba y valor debajo centrado */
  private drawDataRow(
    doc: jsPDF,
    x: number, y: number, w: number, h: number,
    label: string, value: string,
    border: [number, number, number],
    textColor: [number, number, number]
  ): void {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...border);
    doc.setLineWidth(0.3);
    doc.rect(x, y, w, h, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(...textColor);
    doc.text(label, x + 2, y + 3.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(value ?? '', x + w / 2, y + 6.8, { align: 'center' });
  }
}
