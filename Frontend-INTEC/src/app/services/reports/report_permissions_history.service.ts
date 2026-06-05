import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx-js-style';

interface HistoryRecord {
  type: string;
  subtype?: string;
  requestDate: string;
  startDate: string;
  endDate: string;
  daysCount: number;
  vacationYear?: number;
  reason: string;
  description: string;
  withPay: boolean;
}

@Injectable({ providedIn: 'root' })
export class ReportPermissionsHistoryService {

  exportToExcel(employeeName: string, records: HistoryRecord[]): void {
    const emissionDate = new Date().toLocaleString('es-MX', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });

    const COL_COUNT = 10;
    const HEADERS = ['Tipo', 'Inicial/Subsec.', 'Fecha Solicitud', 'Desde', 'Hasta', 'Días', 'Año', 'Motivo', 'Descripción', 'Con Goce'];

    const rows: any[][] = [
      ['HISTORIAL DE PERMISOS Y VACACIONES'],
      [`Colaborador: ${employeeName}`],
      [`Fecha de generación: ${emissionDate}`],
      [],
      HEADERS,
      ...records.map(r => [
        r.type,
        r.subtype       || '-',
        r.requestDate   ? this.formatDate(r.requestDate)  : '-',
        r.startDate     ? this.formatDate(r.startDate)    : '-',
        r.endDate       ? this.formatDate(r.endDate)      : '-',
        r.daysCount ?? '-',
        r.vacationYear  ?? '-',
        r.reason        || '-',
        r.description   || '-',
        r.type === 'Incapacidad' ? '-' : (r.withPay ? 'Sí' : 'No')
      ])
    ];

    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(rows);

    // ── Merges ──────────────────────────────────────────────────────────────
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: COL_COUNT - 1 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: COL_COUNT - 1 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: COL_COUNT - 1 } },
      { s: { r: 3, c: 0 }, e: { r: 3, c: COL_COUNT - 1 } },
    ];

    // ── Column widths ────────────────────────────────────────────────────────
    ws['!cols'] = [
      { wch: 16 }, // Tipo
      { wch: 14 }, // Inicial/Subsec.
      { wch: 18 }, // Fecha Solicitud
      { wch: 14 }, // Desde
      { wch: 14 }, // Hasta
      { wch: 7  }, // Días
      { wch: 7  }, // Año
      { wch: 26 }, // Motivo
      { wch: 38 }, // Descripción
      { wch: 11 }, // Con Goce
    ];

    // ── Row heights ──────────────────────────────────────────────────────────
    ws['!rows'] = [
      { hpt: 32 }, // title
      { hpt: 18 }, // employee
      { hpt: 16 }, // date
      { hpt: 8  }, // separator
      { hpt: 22 }, // headers
    ];

    // ── Styles ───────────────────────────────────────────────────────────────
    const titleStyle: XLSX.CellStyle = {
      font: { bold: true, sz: 15, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '2C3E6B' } },
      alignment: { horizontal: 'center', vertical: 'center' }
    };

    const employeeStyle: XLSX.CellStyle = {
      font: { bold: true, sz: 11, color: { rgb: '2C3E6B' } },
      fill: { fgColor: { rgb: 'EEF2FF' } },
      alignment: { horizontal: 'center', vertical: 'center' }
    };

    const dateStyle: XLSX.CellStyle = {
      font: { sz: 9, color: { rgb: '666666' } },
      fill: { fgColor: { rgb: 'F5F5F5' } },
      alignment: { horizontal: 'center', vertical: 'center' }
    };

    const headerStyle: XLSX.CellStyle = {
      font: { bold: true, sz: 10, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: 'F58525' } },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      border: {
        top:    { style: 'thin', color: { rgb: 'D47020' } },
        bottom: { style: 'thin', color: { rgb: 'D47020' } },
        left:   { style: 'thin', color: { rgb: 'D47020' } },
        right:  { style: 'thin', color: { rgb: 'D47020' } }
      }
    };

    const border: any = {
      top:    { style: 'thin', color: { rgb: 'DDDDDD' } },
      bottom: { style: 'thin', color: { rgb: 'DDDDDD' } },
      left:   { style: 'thin', color: { rgb: 'DDDDDD' } },
      right:  { style: 'thin', color: { rgb: 'DDDDDD' } }
    };

    const baseData: XLSX.CellStyle = {
      font: { sz: 9, color: { rgb: '333333' } },
      alignment: { horizontal: 'left', vertical: 'center', wrapText: true },
      border
    };

    const centerData: XLSX.CellStyle = {
      font: { sz: 9, color: { rgb: '333333' } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border
    };

    // Tipo colors
    const vacStyle: XLSX.CellStyle = {
      font: { bold: true, sz: 9, color: { rgb: '155724' } },
      fill: { fgColor: { rgb: 'D4EDDA' } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border
    };
    const perStyle: XLSX.CellStyle = {
      font: { bold: true, sz: 9, color: { rgb: '004085' } },
      fill: { fgColor: { rgb: 'CCE5FF' } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border
    };
    const incStyle: XLSX.CellStyle = {
      font: { bold: true, sz: 9, color: { rgb: '721C24' } },
      fill: { fgColor: { rgb: 'F8D7DA' } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border
    };

    // Apply header styles
    this.applyRowStyle(ws, 0, 1, [titleStyle]);
    this.applyRowStyle(ws, 1, 1, [employeeStyle]);
    this.applyRowStyle(ws, 2, 1, [dateStyle]);
    this.applyRowStyle(ws, 4, COL_COUNT, Array(COL_COUNT).fill(headerStyle));

    // Apply data row styles
    records.forEach((r, i) => {
      const rowIdx = 5 + i;
      const typeStyle = r.type === 'Vacaciones' ? vacStyle : r.type === 'Permiso' ? perStyle : incStyle;

      const cellStyles = [
        typeStyle, centerData, centerData, centerData, centerData,
        centerData, centerData, baseData, baseData, centerData
      ];

      cellStyles.forEach((style, col) => {
        const cellRef = XLSX.utils.encode_cell({ r: rowIdx, c: col });
        if (!ws[cellRef]) ws[cellRef] = { v: '' };
        ws[cellRef].s = style;
      });

      // Row height for data rows
      if (!ws['!rows']) ws['!rows'] = [];
      ws['!rows'][rowIdx] = { hpt: 18 };
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Historial');

    const fileName = `Historial_${employeeName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  }

  private formatDate(dateStr: string): string {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return dateStr;
    }
  }

  private applyRowStyle(ws: XLSX.WorkSheet, rowIdx: number, colCount: number, styles: XLSX.CellStyle[]): void {
    for (let c = 0; c < colCount; c++) {
      const cellRef = XLSX.utils.encode_cell({ r: rowIdx, c });
      if (!ws[cellRef]) ws[cellRef] = { v: '' };
      ws[cellRef].s = styles[c] ?? styles[0];
    }
  }
}
