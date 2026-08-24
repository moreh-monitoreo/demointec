import ExcelJS from 'exceljs';
import path from 'path';
import { normalizeDate } from './request-firestore.helper';

const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..', '..');
const TEMPLATE_FILE = path.join(PROJECT_ROOT, 'public', 'formatos', 'REQ MAT 04 MERCEDES LOS CABOS.xlsx');

const FIRST_ITEM_ROW = 12;
const LAST_ITEM_ROW = 49;
const BLOCK_HEIGHT = 66;
const LAST_COLUMN = 42;
const OBSERVATION_START = 'AF';
const OBSERVATION_END = 'AM';
const OBSERVATION_LINE_LENGTH = 42;
const OBSERVATION_COLUMNS = ['AF', 'AG', 'AH', 'AI', 'AJ', 'AK', 'AL', 'AM'];
const THIN_SIDE: ExcelJS.Border = { style: 'thin', color: { argb: 'FF000000' } };

export const ITEMS_PER_PAGE = LAST_ITEM_ROW - FIRST_ITEM_ROW + 1;

export interface FormatHeader {
  folio_request: string;
  date?: Date | string;
  project: string;
  locality: string;
  official: string;
  requester: string;
  work: string;
  locationType: string;
  quotedBy?: string;
}

export interface FormatItem {
  code: string;
  name: string;
  unit: string;
  amount: number;
  observation: string;
}

const upper = (value?: string | null): string => String(value || '').toUpperCase();

const blockMerges = (worksheet: ExcelJS.Worksheet): string[][] =>
  (worksheet.model.merges || [])
    .map((reference) => reference.match(/^([A-Z]+)(\d+):([A-Z]+)(\d+)$/))
    .filter((parts): parts is RegExpMatchArray => Boolean(parts) && Number(parts![2]) <= BLOCK_HEIGHT)
    .map((parts) => [parts[1], parts[2], parts[3], parts[4]]);

const resetObservationRows = (worksheet: ExcelJS.Worksheet): void => {
  [...(worksheet.model.merges || [])].forEach((reference) => {
    const parts = reference.match(/^([A-Z]+)(\d+):([A-Z]+)(\d+)$/);
    if (!parts) return;

    const startRow = Number(parts[2]);
    const insideItemArea = startRow >= FIRST_ITEM_ROW && startRow <= LAST_ITEM_ROW;

    if (parts[1] === OBSERVATION_START && insideItemArea) {
      worksheet.unMergeCells(reference);
    }
  });

  for (let row = FIRST_ITEM_ROW; row <= LAST_ITEM_ROW; row++) {
    OBSERVATION_COLUMNS.forEach((column) => {
      worksheet.getCell(`${column}${row}`).border = {
        top: THIN_SIDE,
        left: THIN_SIDE,
        bottom: THIN_SIDE,
        right: THIN_SIDE,
      };
    });

    worksheet.mergeCells(`${OBSERVATION_START}${row}:${OBSERVATION_END}${row}`);
  }
};

const observationBoxHeight = (notes: string[], itemCount: number): number => {
  const lines = notes.reduce(
    (total, note) => total + Math.max(1, Math.ceil(note.length / OBSERVATION_LINE_LENGTH)),
    0
  );

  return Math.min(Math.max(itemCount, lines, 1), ITEMS_PER_PAGE);
};

const applyObservationBox = (
  worksheet: ExcelJS.Worksheet,
  offset: number,
  height: number,
  text: string
): void => {
  const firstRow = FIRST_ITEM_ROW + offset;
  const lastRow = firstRow + height - 1;

  for (let row = firstRow; row <= lastRow; row++) {
    if (worksheet.getCell(`${OBSERVATION_START}${row}`).isMerged) {
      worksheet.unMergeCells(`${OBSERVATION_START}${row}:${OBSERVATION_END}${row}`);
    }
  }

  worksheet.mergeCells(`${OBSERVATION_START}${firstRow}:${OBSERVATION_END}${lastRow}`);
  worksheet.getCell(`${OBSERVATION_START}${firstRow}`).value = text || null;
};

const clearItemRows = (worksheet: ExcelJS.Worksheet, offset: number = 0): void => {
  for (let row = FIRST_ITEM_ROW; row <= LAST_ITEM_ROW; row++) {
    const target = row + offset;

    worksheet.getCell(`A${target}`).value = null;
    worksheet.getCell(`C${target}`).value = null;
    worksheet.getCell(`X${target}`).value = null;
    worksheet.getCell(`AB${target}`).value = null;
    worksheet.getCell(`${OBSERVATION_START}${target}`).value = null;
  }
};

const clonePage = (worksheet: ExcelJS.Worksheet, merges: string[][], pageIndex: number): void => {
  const offset = pageIndex * BLOCK_HEIGHT;

  for (let row = 1; row <= BLOCK_HEIGHT; row++) {
    const source = worksheet.getRow(row);
    const target = worksheet.getRow(row + offset);

    if (source.height) target.height = source.height;

    for (let column = 1; column <= LAST_COLUMN; column++) {
      const from = source.getCell(column);
      const to = target.getCell(column);

      to.style = from.style;
      to.value = from.value;
    }
  }

  merges.forEach(([startColumn, startRow, endColumn, endRow]) => {
    worksheet.mergeCells(
      `${startColumn}${Number(startRow) + offset}:${endColumn}${Number(endRow) + offset}`
    );
  });

  const logo = worksheet.getImages()[0];
  if (logo) {
    const anchor = logo.range as unknown as {
      tl: { nativeCol: number; nativeRow: number };
      ext: { width: number; height: number };
    };

    worksheet.addImage(Number(logo.imageId), {
      tl: { col: anchor.tl.nativeCol, row: anchor.tl.nativeRow + offset } as ExcelJS.Anchor,
      ext: { width: anchor.ext.width, height: anchor.ext.height },
      editAs: 'oneCell',
    });
  }
};

const fillHeader = (worksheet: ExcelJS.Worksheet, header: FormatHeader): void => {
  worksheet.getCell('AI3').value = header.folio_request;
  worksheet.getCell('AI5').value = normalizeDate(header.date) || new Date();
  worksheet.getCell('E7').value = upper(header.project);
  worksheet.getCell('AH7').value = upper(header.official);
  worksheet.getCell('E8').value = upper(header.locality);
  worksheet.getCell('AH8').value = upper(header.requester);
  worksheet.getCell('E9').value = upper(header.work);
  worksheet.getCell('Z65').value = upper(header.quotedBy) || null;

  const isLocal = upper(header.locationType).startsWith('LOCAL');
  worksheet.getCell('T7').value = isLocal ? 'X' : null;
  worksheet.getCell('Y7').value = isLocal ? null : 'X';
};

export const buildRequestFormat = async (header: FormatHeader, items: FormatItem[]): Promise<Buffer> => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(TEMPLATE_FILE);

  const worksheet = workbook.worksheets[0];
  resetObservationRows(worksheet);
  clearItemRows(worksheet);
  fillHeader(worksheet, header);

  const pages = Math.max(Math.ceil(items.length / ITEMS_PER_PAGE), 1);
  const merges = blockMerges(worksheet);

  for (let page = 1; page < pages; page++) {
    clonePage(worksheet, merges, page);
    clearItemRows(worksheet, page * BLOCK_HEIGHT);
  }

  items.forEach((item, index) => {
    const page = Math.floor(index / ITEMS_PER_PAGE);
    const row = FIRST_ITEM_ROW + (index % ITEMS_PER_PAGE) + page * BLOCK_HEIGHT;

    worksheet.getCell(`A${row}`).value = item.code || null;
    worksheet.getCell(`C${row}`).value = upper(item.name);
    worksheet.getCell(`X${row}`).value = upper(item.unit);
    worksheet.getCell(`AB${row}`).value = Number(item.amount) || 0;
  });

  for (let page = 0; page < pages; page++) {
    const pageItems = items.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);
    const notes = Array.from(
      new Set(pageItems.map((item) => upper(item.observation)).filter((text) => text !== ''))
    );

    applyObservationBox(
      worksheet,
      page * BLOCK_HEIGHT,
      observationBoxHeight(notes, pageItems.length),
      notes.join('\n')
    );
  }

  if (pages > 1) {
    worksheet.pageSetup.fitToHeight = 0;

    for (let page = 1; page < pages; page++) {
      worksheet.getRow(page * BLOCK_HEIGHT).addPageBreak();
    }
  }

  return (await workbook.xlsx.writeBuffer()) as Buffer;
};
