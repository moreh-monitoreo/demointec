import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx-js-style';
import { Prenomina } from '../../models/prenomina';

interface PrenominaGroup {
  project: string;
  employees: Prenomina[];
}

@Injectable({
  providedIn: 'root'
})
export class ReportPrenominaService {

  exportToExcel(data: Prenomina[], isMultiDay: boolean, startDate: string, endDate: string): void {
    const groups = this.buildGroups(data);
    const colCount = isMultiDay ? 7 : 6;

    const rows: any[][] = [];

    // Titulo
    const titleRow = ['REPORTE DE PRENOMINA'];
    rows.push(titleRow);

    // Periodo
    const periodLabel = isMultiDay
      ? `Periodo: ${this.formatDate(startDate)} al ${this.formatDate(endDate)}`
      : `Fecha: ${this.formatDate(startDate)}`;
    rows.push([periodLabel]);

    // Fecha de emisión
    const emissionDate = new Date().toLocaleString('es-ES', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    rows.push([`Fecha de emisión: ${emissionDate}`]);

    // Fila vacía
    rows.push([]);

    // Headers
    const headers = isMultiDay
      ? ['Colaborador', 'Estatus', 'Fecha', 'Entrada', 'Salida', 'Desc. Préstamo', 'Firma']
      : ['Colaborador', 'Estatus', 'Entrada', 'Salida', 'Desc. Préstamo', 'Firma'];
    rows.push(headers);

    const headerRowIndex = rows.length - 1;

    // Tracks para saber qué filas son de obra
    const projectRowIndices: number[] = [];
    const dataStartIndex = rows.length;

    for (const group of groups) {
      const projectRow = new Array(colCount).fill('');
      projectRow[0] = `${group.project} (${group.employees.length})`;
      rows.push(projectRow);
      projectRowIndices.push(rows.length - 1);

      for (const emp of group.employees) {
        if (isMultiDay) {
          rows.push([
            emp.name_employee,
            emp.status,
            emp.date,
            emp.entry_time || '---',
            emp.exit_time || '---',
            emp.loan_discount ? `$${emp.loan_discount.toFixed(2)}` : '---',
            ''
          ]);
        } else {
          rows.push([
            emp.name_employee,
            emp.status,
            emp.entry_time || '---',
            emp.exit_time || '---',
            emp.loan_discount ? `$${emp.loan_discount.toFixed(2)}` : '---',
            ''
          ]);
        }
      }
    }

    // Resumen al final
    rows.push([]);
    const totalEmployees = new Set(data.map(d => d.name_employee)).size;
    const enObra = data.filter(d => d.status === 'En Obra').length;
    const faltas = data.filter(d => d.status === 'Falta').length;
    rows.push([`Total colaboradores: ${totalEmployees}`]);
    rows.push([`Registros En Obra: ${enObra}`]);
    rows.push([`Registros Falta: ${faltas}`]);
    rows.push([`Total registros: ${data.length}`]);

    const summaryStartIndex = rows.length - 4;

    // Crear worksheet
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(rows);

    // Merge titulo (fila 0)
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: colCount - 1 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: colCount - 1 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: colCount - 1 } },
    ];

    // Merge filas de obra
    for (const idx of projectRowIndices) {
      ws['!merges']!.push({ s: { r: idx, c: 0 }, e: { r: idx, c: colCount - 1 } });
    }

    // Merge filas de resumen
    for (let i = summaryStartIndex; i < rows.length; i++) {
      ws['!merges']!.push({ s: { r: i, c: 0 }, e: { r: i, c: colCount - 1 } });
    }

    // Estilos
    const titleStyle: XLSX.CellStyle = {
      font: { bold: true, sz: 16, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '2A7AE4' } },
      alignment: { horizontal: 'center', vertical: 'center' }
    };

    const periodStyle: XLSX.CellStyle = {
      font: { bold: true, sz: 11, color: { rgb: '333333' } },
      fill: { fgColor: { rgb: 'E8F0FE' } },
      alignment: { horizontal: 'center', vertical: 'center' }
    };

    const emissionStyle: XLSX.CellStyle = {
      font: { sz: 9, color: { rgb: '666666' } },
      fill: { fgColor: { rgb: 'F5F5F5' } },
      alignment: { horizontal: 'center', vertical: 'center' }
    };

    const headerStyle: XLSX.CellStyle = {
      font: { bold: true, sz: 10, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: 'F58525' } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: {
        bottom: { style: 'thin', color: { rgb: 'D47020' } }
      }
    };

    const projectStyle: XLSX.CellStyle = {
      font: { bold: true, sz: 10, color: { rgb: '2A7AE4' } },
      fill: { fgColor: { rgb: 'E9ECF0' } },
      alignment: { horizontal: 'left', vertical: 'center' },
      border: {
        bottom: { style: 'thin', color: { rgb: 'CCCCCC' } },
        top: { style: 'thin', color: { rgb: 'CCCCCC' } }
      }
    };

    const dataStyle: XLSX.CellStyle = {
      font: { sz: 9, color: { rgb: '333333' } },
      alignment: { horizontal: 'left', vertical: 'center' },
      border: {
        bottom: { style: 'thin', color: { rgb: 'EEEEEE' } }
      }
    };

    const dataCenterStyle: XLSX.CellStyle = {
      font: { sz: 9, color: { rgb: '333333' } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: {
        bottom: { style: 'thin', color: { rgb: 'EEEEEE' } }
      }
    };

    const statusEnObraStyle: XLSX.CellStyle = {
      font: { bold: true, sz: 9, color: { rgb: '155724' } },
      fill: { fgColor: { rgb: 'D4EDDA' } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: {
        bottom: { style: 'thin', color: { rgb: 'EEEEEE' } }
      }
    };

    const statusFaltaStyle: XLSX.CellStyle = {
      font: { bold: true, sz: 9, color: { rgb: '721C24' } },
      fill: { fgColor: { rgb: 'F8D7DA' } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: {
        bottom: { style: 'thin', color: { rgb: 'EEEEEE' } }
      }
    };

    const summaryStyle: XLSX.CellStyle = {
      font: { bold: true, sz: 10, color: { rgb: '333333' } },
      fill: { fgColor: { rgb: 'E8F0FE' } },
      alignment: { horizontal: 'left', vertical: 'center' },
      border: {
        bottom: { style: 'thin', color: { rgb: 'CCCCCC' } }
      }
    };

    const discountStyle: XLSX.CellStyle = {
      font: { bold: true, sz: 9, color: { rgb: '856404' } },
      fill: { fgColor: { rgb: 'FFF3CD' } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: {
        bottom: { style: 'thin', color: { rgb: 'EEEEEE' } }
      }
    };

    // Aplicar estilos fila por fila
    for (let R = 0; R < rows.length; R++) {
      for (let C = 0; C < colCount; C++) {
        const addr = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[addr]) ws[addr] = { v: '', t: 's' };

        if (R === 0) {
          ws[addr].s = titleStyle;
        } else if (R === 1) {
          ws[addr].s = periodStyle;
        } else if (R === 2) {
          ws[addr].s = emissionStyle;
        } else if (R === headerRowIndex) {
          ws[addr].s = headerStyle;
        } else if (projectRowIndices.includes(R)) {
          ws[addr].s = projectStyle;
        } else if (R >= summaryStartIndex) {
          ws[addr].s = summaryStyle;
        } else if (R > headerRowIndex) {
          // Filas de datos de empleados
          if (C === 1) {
            const cellValue = ws[addr].v;
            ws[addr].s = cellValue === 'En Obra' ? statusEnObraStyle : statusFaltaStyle;
          } else if (C === colCount - 2) {
            // Columna Desc. Préstamo
            const cellValue = ws[addr].v;
            ws[addr].s = cellValue && cellValue !== '---' ? discountStyle : dataCenterStyle;
          } else if (C === 0) {
            ws[addr].s = dataStyle;
          } else {
            ws[addr].s = dataCenterStyle;
          }
        }
      }
    }

    // Anchos de columna
    if (isMultiDay) {
      ws['!cols'] = [
        { wch: 35 },  // Colaborador
        { wch: 14 },  // Estatus
        { wch: 14 },  // Fecha
        { wch: 12 },  // Entrada
        { wch: 12 },  // Salida
        { wch: 16 },  // Desc. Préstamo
        { wch: 18 },  // Firma
      ];
    } else {
      ws['!cols'] = [
        { wch: 35 },  // Colaborador
        { wch: 14 },  // Estatus
        { wch: 12 },  // Entrada
        { wch: 12 },  // Salida
        { wch: 16 },  // Desc. Préstamo
        { wch: 18 },  // Firma
      ];
    }

    // Alto de filas
    ws['!rows'] = [];
    ws['!rows'][0] = { hpx: 30 };
    ws['!rows'][1] = { hpx: 22 };
    ws['!rows'][2] = { hpx: 18 };
    ws['!rows'][headerRowIndex] = { hpx: 24 };

    // Ocultar gridlines
    ws['!views'] = [{ showGridLines: false }];

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Prenomina');

    const fileName = `Prenomina_${startDate}_${endDate}.xlsx`;
    XLSX.writeFile(wb, fileName);
  }

  private buildGroups(data: Prenomina[]): PrenominaGroup[] {
    const map = new Map<string, Prenomina[]>();

    for (const item of data) {
      const key = item.project || 'Sin Obra';
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(item);
    }

    return Array.from(map.entries()).map(([project, employees]) => ({
      project,
      employees
    }));
  }

  private formatDate(dateStr: string): string {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  }
}
