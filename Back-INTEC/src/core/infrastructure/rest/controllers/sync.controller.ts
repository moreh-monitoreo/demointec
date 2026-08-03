import { Request, Response } from 'express';
import mysql from 'mysql2/promise';

const BATCH_SIZE = 500;

interface TableSyncResult {
  table: string;
  rows: number;
}

interface TableSyncFailure {
  table: string;
  error: string;
}

async function getSourceTables(sourceConn: mysql.Connection, dbName: string): Promise<string[]> {
  const [rows] = await sourceConn.query(
    `SELECT TABLE_NAME AS name FROM information_schema.tables
     WHERE table_schema = ? AND table_type = 'BASE TABLE'
     ORDER BY TABLE_NAME`,
    [dbName]
  );
  return (rows as any[]).map(r => r.name);
}

async function migrateTable(
  sourceConn: mysql.Connection,
  targetConn: mysql.Connection,
  table: string
): Promise<TableSyncResult> {
  const [createRows] = await sourceConn.query(`SHOW CREATE TABLE \`${table}\``);
  const createStmt = (createRows as any[])[0]['Create Table'];

  await targetConn.query(`DROP TABLE IF EXISTS \`${table}\``);
  await targetConn.query(createStmt);

  const [countRows] = await sourceConn.query(`SELECT COUNT(*) AS total FROM \`${table}\``);
  const total = (countRows as any[])[0].total;

  if (total === 0) {
    return { table, rows: 0 };
  }

  let migrated = 0;
  for (let offset = 0; offset < total; offset += BATCH_SIZE) {
    const [rows] = await sourceConn.query(
      `SELECT * FROM \`${table}\` LIMIT ${BATCH_SIZE} OFFSET ${offset}`
    );
    const rowsArr = rows as any[];
    if (rowsArr.length === 0) break;

    const columns = Object.keys(rowsArr[0]);
    const values = rowsArr.map(row => columns.map(col => row[col]));
    const columnList = columns.map(c => `\`${c}\``).join(', ');

    await targetConn.query(`INSERT INTO \`${table}\` (${columnList}) VALUES ?`, [values]);
    migrated += rowsArr.length;
  }

  return { table, rows: migrated };
}

export class SyncController {
  async syncRailway(req: Request, res: Response): Promise<void> {
    let sourceConn: mysql.Connection | undefined;
    let targetConn: mysql.Connection | undefined;

    try {
      sourceConn = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '3306', 10),
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        ssl: { rejectUnauthorized: false },
      });

      targetConn = await mysql.createConnection({
        host: process.env.RAILWAY_DB_HOST,
        port: parseInt(process.env.RAILWAY_DB_PORT || '3306', 10),
        user: process.env.MYSQLUSER,
        password: process.env.MYSQL_ROOT_PASSWORD,
        database: process.env.MYSQL_DATABASE,
      });

      await targetConn.query('SET FOREIGN_KEY_CHECKS = 0');

      const tables = await getSourceTables(sourceConn, process.env.DB_NAME!);
      const results: TableSyncResult[] = [];
      const failures: TableSyncFailure[] = [];

      for (const table of tables) {
        try {
          results.push(await migrateTable(sourceConn, targetConn, table));
        } catch (err: any) {
          failures.push({ table, error: err.message });
        }
      }

      await targetConn.query('SET FOREIGN_KEY_CHECKS = 1');

      res.status(failures.length > 0 ? 207 : 200).json({
        msg: failures.length > 0 ? 'Sincronización completada con errores.' : 'Sincronización completada.',
        tables: results,
        failures,
      });
    } catch (error: any) {
      console.error('Error en sincronización con Railway:', error);
      res.status(500).json({ message: error.message });
    } finally {
      if (sourceConn) await sourceConn.end();
      if (targetConn) await targetConn.end();
    }
  }
}
