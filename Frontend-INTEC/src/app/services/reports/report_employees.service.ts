import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Employee } from '../../models/employees';

@Injectable({
  providedIn: 'root'
})
export class ReportEmployeesService {
  private logoBase64: string | null = null;

  constructor() { }

  private async loadLogoBase64(): Promise<string> {
    if (this.logoBase64) return this.logoBase64;
    const response = await fetch('assets/logo.png');
    const blob = await response.blob();
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        this.logoBase64 = reader.result as string;
        resolve(this.logoBase64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  async generateEmployeesReport(employees: Employee[], title: string = 'CATÁLOGO DE EMPLEADOS'): Promise<void> {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const logoBase64 = await this.loadLogoBase64();
    const currentDate = new Date().toLocaleString('es-ES', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    const header = (data: any) => {
      pdf.addImage(logoBase64, 'PNG', 15, 10, 20, 12);
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.1);
      pdf.line(15, 24, pageWidth - 15, 24);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(17);
      const titleWidth = pdf.getTextWidth(title);
      pdf.text(title, (pageWidth - titleWidth) / 2, 20);
      const isFirstPage = pdf.getCurrentPageInfo().pageNumber === 1;
      if (isFirstPage) {
        const marginRight = 20;
        const dateBoxWidth = 60;
        const dateBoxHeight = 6;
        const dateBoxX = pageWidth - marginRight - dateBoxWidth;
        const dateBoxY = 24 + 4;
        pdf.setFillColor(173, 216, 230);
        pdf.rect(dateBoxX, dateBoxY, dateBoxWidth, dateBoxHeight, 'F');
        pdf.setDrawColor(0, 0, 0);
        pdf.rect(dateBoxX, dateBoxY, dateBoxWidth, dateBoxHeight);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9);
        pdf.setTextColor('#000000');
        pdf.text('Fecha de Emisión:', dateBoxX + dateBoxWidth / 2, dateBoxY + 4.2, { align: 'center' });
        const dateValueBoxY = dateBoxY + dateBoxHeight;
        const dateValueBoxHeight = 6;
        pdf.setFillColor(255, 255, 255);
        pdf.rect(dateBoxX, dateValueBoxY, dateBoxWidth, dateValueBoxHeight, 'F');
        pdf.setDrawColor(0, 0, 0);
        pdf.rect(dateBoxX, dateValueBoxY, dateBoxWidth, dateValueBoxHeight);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.setTextColor('#000000');
        pdf.text(currentDate, dateBoxX + dateBoxWidth / 2, dateValueBoxY + 4.2, { align: 'center' });
      }
    };
    const footer = (data: any) => {
      const footerText = 'Misioneros 2138 Col. Jardines del Country\nCP 44210, Guadalajara\nTel:  3336829197';
      const lines = footerText.split('\n');
      const fontSize = 7;
      const color = '#F58525';
      const logoWidth = 20;
      const logoHeight = 12;
      const marginRight = 15;
      const marginBottom = 8;
      const textRight = logoWidth + 13;
      let y = pageHeight - marginBottom - logoHeight + 2;
      const lineY = y - 4;
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.1);
      pdf.line(15, lineY, pageWidth - 15, lineY);
      pdf.setFontSize(fontSize);
      pdf.setTextColor(color);
      lines.forEach((line, idx) => {
        pdf.text(line, pageWidth - textRight, y + idx * (fontSize - 4), { align: 'right' });
      });
      pdf.addImage(logoBase64, 'PNG', pageWidth - logoWidth - marginRight, pageHeight - logoHeight - marginBottom - 2, logoWidth, logoHeight);
      pdf.setTextColor('#000000');
    };
    const tableBody: string[][] = employees.map(emp => [
      emp.name_employee,
      emp.email ?? '',
      emp.phone ?? '',
      emp.role ?? '',
      emp.status ? 'Activo' : 'Inactivo'
    ]);
    autoTable(pdf, {
      startY: 50,
      margin: { top: 44, left: 20, right: 20, bottom: 30 },
      head: [['Nombre', 'Email', 'Teléfono', 'Rol', 'Estado']],
      body: tableBody,
      theme: 'grid',
      headStyles: {
        fillColor: [173, 216, 230],
        textColor: 0,
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle',
        fontSize: 10,
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 2,
        valign: 'middle',
        halign: 'left',
        textColor: 20,
      },
      columnStyles: {
        4: { // Estado
          halign: 'center',
          fontStyle: 'bold',
          cellWidth: 25,
        }
      },
      styles: {
        lineWidth: 0.3,
        lineColor: [136, 136, 136], // Gris
        overflow: 'linebreak',
        cellWidth: 'wrap',
      },
      didParseCell: (data: any) => {
        if (data.section === 'body' && data.column.index === 4) {
          if (data.cell.raw === 'Activo') {
            data.cell.styles.textColor = [0, 128, 0];
          } else {
            data.cell.styles.textColor = [211, 47, 47];
          }
        }
      },
      didDrawPage: (data: any) => {
        header(data);
        footer(data);
      }
    });
    const fileName = `catalogo_empleados_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
  }
} 