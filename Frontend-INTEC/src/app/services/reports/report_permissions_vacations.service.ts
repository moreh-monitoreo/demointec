import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx-js-style';

interface PermissionVacationRow {
  antiguedad: number;
  num: string;
  nombre: string;
  fechaIngreso: string;
  diasPorTomarPrevious: number;
  aniversarioCurrent: string;
  totalVacaciones: number;
  diasTomados: number;
  diasPorTomarCurrent: number;
  saldoTotal: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReportPermissionsVacationsService {

  exportToExcel(rows: any[], previousYear: number, currentYear: number): void {
    const data = this.buildExportData(rows);
    const colCount = 10; // columnas de datos (sin Registros)

    const excelRows: any[][] = [];

    // Titulo
    excelRows.push(['REPORTE DE PERMISOS Y VACACIONES']);

    // Periodo
    excelRows.push([`Período: ${previousYear} - ${currentYear}`]);

    // Fecha de emisión
    const emissionDate = new Date().toLocaleString('es-ES', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    excelRows.push([`Fecha de emisión: ${emissionDate}`]);

    // Fila vacía
    excelRows.push([]);

    // Headers
    excelRows.push([
      'ANTIGÜEDAD',
      'NUM.',
      'NOMBRE',
      'FECHA INGRESO',
      `DÍAS POR TOMAR ${previousYear}`,
      `ANIVERSARIO ${currentYear}`,
      'TOTAL DÍAS LEY',
      'DÍAS TOMADOS',
      `DÍAS POR TOMAR ${currentYear}`,
      'SALDO TOTAL'
    ]);

    const headerRowIndex = excelRows.length - 1;

    for (const row of data) {
      excelRows.push([
        `${row.antiguedad} Años`,
        row.num,
        row.nombre,
        row.fechaIngreso,
        row.diasPorTomarPrevious,
        row.aniversarioCurrent,
        row.totalVacaciones,
        row.diasTomados,
        row.diasPorTomarCurrent,
        row.saldoTotal
      ]);
    }

    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(excelRows);

    // Merges
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: colCount - 1 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: colCount - 1 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: colCount - 1 } },
    ];

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
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      border: { bottom: { style: 'thin', color: { rgb: 'D47020' } } }
    };

    const dataStyle: XLSX.CellStyle = {
      font: { sz: 9, color: { rgb: '333333' } },
      alignment: { horizontal: 'left', vertical: 'center' },
      border: { bottom: { style: 'thin', color: { rgb: 'EEEEEE' } } }
    };

    const dataCenterStyle: XLSX.CellStyle = {
      font: { sz: 9, color: { rgb: '333333' } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: { bottom: { style: 'thin', color: { rgb: 'EEEEEE' } } }
    };

    const dataBlueStyle: XLSX.CellStyle = {
      font: { sz: 9, color: { rgb: '333333' } },
      fill: { fgColor: { rgb: 'DBEAFE' } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: { bottom: { style: 'thin', color: { rgb: 'EEEEEE' } } }
    };

    const dataBoldStyle: XLSX.CellStyle = {
      font: { bold: true, sz: 9, color: { rgb: '333333' } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: { bottom: { style: 'thin', color: { rgb: 'EEEEEE' } } }
    };


    // Columnas con fondo azul claro (indices): 0=Antigüedad, 4=DíasPorTomar Previous, 8=DíasPorTomar Current
    const blueCols = new Set([0, 4, 8]);

    for (let R = 0; R < excelRows.length; R++) {
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
        } else if (R > headerRowIndex) {
          if (C === 2) {
            // Nombre alineado a la izquierda
            ws[addr].s = dataStyle;
          } else if (C === 9) {
            // Saldo Total bold
            ws[addr].s = dataBoldStyle;
          } else if (blueCols.has(C)) {
            ws[addr].s = dataBlueStyle;
          } else {
            ws[addr].s = dataCenterStyle;
          }
        }
      }
    }

    // Anchos de columna
    ws['!cols'] = [
      { wch: 12 },  // Antigüedad
      { wch: 8 },   // Num
      { wch: 30 },  // Nombre
      { wch: 14 },  // Fecha Ingreso
      { wch: 14 },  // Días por tomar prev
      { wch: 14 },  // Aniversario
      { wch: 14 },  // Total Días Ley
      { wch: 13 },  // Días Tomados
      { wch: 14 },  // Días por tomar current
      { wch: 11 },  // Saldo Total
    ];

    // Alto de filas
    ws['!rows'] = [];
    ws['!rows'][0] = { hpx: 30 };
    ws['!rows'][1] = { hpx: 22 };
    ws['!rows'][2] = { hpx: 18 };
    ws['!rows'][headerRowIndex] = { hpx: 28 };

    // Filas de datos
    for (let R = headerRowIndex + 1; R < excelRows.length; R++) {
      ws['!rows'][R] = { hpx: 22 };
    }

    ws['!views'] = [{ showGridLines: false }];

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Permisos y Vacaciones');

    const today = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `PermisosVacaciones_${today}.xlsx`);
  }

  private buildExportData(rows: any[]): PermissionVacationRow[] {
    return rows.map(row => ({
      antiguedad: row.antiguedad,
      num: row.num,
      nombre: row.nombre,
      fechaIngreso: row.fechaIngreso,
      diasPorTomarPrevious: row.diasPorTomarPrevious,
      aniversarioCurrent: row.aniversarioCurrent,
      totalVacaciones: row.totalVacaciones,
      diasTomados: row.diasTomados,
      diasPorTomarCurrent: row.diasPorTomarCurrent,
      saldoTotal: row.saldoTotal
    }));
  }
}
