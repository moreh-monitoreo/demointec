import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';

export interface ResponsivaLlavesData {
  dia: string;
  mes: string;
  anio: string;
  nombre: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReportResponsivaLlavesService {

  async generate(data: ResponsivaLlavesData): Promise<void> {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const logoBase64 = await this.loadLogoBase64();

    this.drawDocument(doc, data, logoBase64);

    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    doc.save(`ResponsivaLlaves_${today}.pdf`);
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

  private drawDocument(doc: jsPDF, data: ResponsivaLlavesData, logoBase64: string | null): void {
    const lm = 25;
    const rm = 25;
    const pw = 210 - lm - rm;
    const dark: [number, number, number] = [20, 20, 20];
    const fs = 10.5;
    const lh = 6;

    // ── Logo ──────────────────────────────────────────────────────────────────
    if (logoBase64) {
      doc.addImage(logoBase64, 'PNG', lm, 10, 18, 18);
    }

    // ── Nombre empresa ────────────────────────────────────────────────────────
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(dark[0], dark[1], dark[2]);
    doc.text('INTEC DE JALISCO S.A. DE C.V.', lm + 26, 24);

    // ── Fecha alineada a la derecha ───────────────────────────────────────────
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fs);
    const anioShort = data.anio ? data.anio.slice(-2) : '__';
    const fechaStr = `Guadalajara, a ${data.dia || '____'} de ${data.mes || '_______________'} de 202${anioShort}.`;
    doc.text(fechaStr, lm + pw, 34, { align: 'right' });

    // ── Título ────────────────────────────────────────────────────────────────
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('CARTA RESPONSIVA', 105, 48, { align: 'center' });

    let y = 60;

    // ── Párrafo introductorio con nombre subrayado inline ────────────────────
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fs);
    doc.setTextColor(dark[0], dark[1], dark[2]);

    const fullText = 'Por medio de la presente hago constar que yo, ' + data.nombre + ', recibí de INTEC DE JALISCO S.A. DE C.V. (en adelante la empresa) la llave abajo mencionada, para el uso exclusivo de cierre de oficinas:';
    y = this.drawJustified(doc, doc.splitTextToSize(fullText, pw), lm, y, pw, lh);
    y += 4;

    // ── Llave ─────────────────────────────────────────────────────────────────
    doc.text('-  1 llave acceso (ingreso a patio lateral)', lm + 4, y);
    y += lh + 4;

    // ── Estado ────────────────────────────────────────────────────────────────
    const estadoLines = doc.splitTextToSize(
      'Estado: La llave antes descrita se encuentra en funcionamiento y en buen estado.',
      pw
    );
    y = this.drawJustified(doc, estadoLines, lm, y, pw, lh);

    const compLines = doc.splitTextToSize('Por ende, me comprometo a lo siguiente:', pw);
    y = this.drawJustified(doc, compLines, lm, y, pw, lh);
    y += 2;

    // ── Compromisos (con guion y sangría) ─────────────────────────────────────
    const indentX = lm + 10;
    const indentW = pw - 10;

    const compromisos = [
      'No prestarla a ninguna persona a menos que cuente con autorización expresa del Representante Legal de la empresa y/o de alguna persona autorizada por ella misma.',
      'No sacar duplicado, sin antes contar con la autorización expresa del Representante Legal de la empresa y/o de alguna persona autorizada por ella misma.',
      'En caso de robo o extravío dar aviso inmediato al Representante Legal de la empresa, así como a R.H., con su aprobación, llamar al cerrajero de inmediato para cambiar la cerradura y las llaves. Cubrir los gastos que se deriven.',
      'Cerrar la puerta de acceso al patio al termino de labores.',
      'Activar la alarma de presionando las teclas \u201c4507\u201d y posteriormente presiona la tecla 2 para activar, contarás con 90 segundos para cerrar la puerta eléctrica y finalmente la puerta peatonal, previa comprobación de que todas las puertas y ventanas de la empresa están correctamente cerradas, en caso de ser la última persona en salir de la oficina.',
      'Avisar con al menos 3 días de anticipación al Representante Legal de la empresa, así como a R.H, en caso de querer entrar a las oficinas el domingo. De asistir en fin de semana, cerrar TODAS las puertas con llave al salir y activar la alarma.',
    ];

    for (const c of compromisos) {
      // Guion al inicio
      doc.text('-', lm + 4, y);
      const lines = doc.splitTextToSize(c, indentW);
      y = this.drawJustified(doc, lines, indentX, y, indentW, lh);
      y += 1;
    }
    y += 2;

    // ── Párrafo final ─────────────────────────────────────────────────────────
    const finalText = 'Comprendo que la seguridad de la empresa puede verse comprometida, por lo que los daños ocasionados por mal manejo o imprudencia serán mi responsabilidad y asumo las consecuencias que estos deriven.';
    const finalLines = doc.splitTextToSize(finalText, pw);
    y = this.drawJustified(doc, finalLines, lm, y, pw, lh);
    y += 18;

    // ── Firma ─────────────────────────────────────────────────────────────────
    const sigX = 105;
    doc.setLineWidth(0.4);
    doc.setDrawColor(dark[0], dark[1], dark[2]);
    doc.line(sigX - 30, y, sigX + 30, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Nombre', sigX, y, { align: 'center' });
    y += 5.5;
    doc.text('Fecha y Firma', sigX, y, { align: 'center' });
  }

  private drawJustified(doc: jsPDF, lines: string[], x: number, y: number, pw: number, lineH: number): number {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const isLast = i === lines.length - 1;
      if (isLast || line.trim().split(' ').length <= 1) {
        doc.text(line, x, y);
      } else {
        const words = line.trim().split(' ');
        const lw = doc.getTextWidth(line.trim());
        const sp = (pw - lw + doc.getTextWidth(' ') * (words.length - 1)) / (words.length - 1);
        let cx = x;
        for (const word of words) {
          doc.text(word, cx, y);
          cx += doc.getTextWidth(word) + sp;
        }
      }
      y += lineH;
    }
    return y;
  }
}
