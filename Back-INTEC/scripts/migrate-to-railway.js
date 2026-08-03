/**
 * Script de migracion de base de datos: Azure MySQL -> Railway MySQL.
 *
 * Uso:
 *   node scripts/migrate-to-railway.js
 *
 * Requiere en .env:
 *   Origen:  DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME
 *   Destino: RAILWAY_DB_HOST, RAILWAY_DB_PORT, MYSQLUSER, MYSQL_ROOT_PASSWORD, MYSQL_DATABASE
 *
 * Recrea cada tabla del origen en el destino (DROP + CREATE con el mismo
 * esquema) y copia todas las filas. Los checks de llaves foraneas se
 * desactivan durante la migracion para no depender del orden entre tablas.
 */

'use strict';

const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const BATCH_SIZE = 500;

async function getSourceTables(sourceConn, dbName) {
  const [rows] = await sourceConn.query(
    `SELECT TABLE_NAME AS name FROM information_schema.tables
     WHERE table_schema = ? AND table_type = 'BASE TABLE'
     ORDER BY TABLE_NAME`,
    [dbName]
  );
  return rows.map(r => r.name);
}

async function migrateTable(sourceConn, targetConn, table) {
  const [createRows] = await sourceConn.query(`SHOW CREATE TABLE \`${table}\``);
  const createStmt = createRows[0]['Create Table'];

  await targetConn.query(`DROP TABLE IF EXISTS \`${table}\``);
  await targetConn.query(createStmt);

  const [countRows] = await sourceConn.query(`SELECT COUNT(*) AS total FROM \`${table}\``);
  const total = countRows[0].total;

  if (total === 0) {
    return { table, rows: 0 };
  }

  let migrated = 0;
  for (let offset = 0; offset < total; offset += BATCH_SIZE) {
    const [rows] = await sourceConn.query(
      `SELECT * FROM \`${table}\` LIMIT ${BATCH_SIZE} OFFSET ${offset}`
    );
    if (rows.length === 0) break;

    const columns = Object.keys(rows[0]);
    const values = rows.map(row => columns.map(col => row[col]));
    const columnList = columns.map(c => `\`${c}\``).join(', ');

    await targetConn.query(
      `INSERT INTO \`${table}\` (${columnList}) VALUES ?`,
      [values]
    );
    migrated += rows.length;
  }

  return { table, rows: migrated };
}

async function main() {
  console.log('Conectando a base de datos origen (Azure)...');
  const sourceConn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false },
  });

  console.log('Conectando a base de datos destino (Railway)...');
  const targetConn = await mysql.createConnection({
    host: process.env.RAILWAY_DB_HOST,
    port: parseInt(process.env.RAILWAY_DB_PORT || '3306', 10),
    user: process.env.MYSQLUSER,
    password: process.env.MYSQL_ROOT_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });

  await targetConn.query('SET FOREIGN_KEY_CHECKS = 0');

  const tables = await getSourceTables(sourceConn, process.env.DB_NAME);
  console.log(`Tablas encontradas: ${tables.length}`);

  const results = [];
  const failures = [];

  for (const table of tables) {
    try {
      console.log(`Migrando tabla "${table}"...`);
      const result = await migrateTable(sourceConn, targetConn, table);
      results.push(result);
      console.log(`  -> ${result.rows} filas migradas.`);
    } catch (err) {
      console.error(`  Error migrando "${table}":`, err.message);
      failures.push({ table, error: err.message });
    }
  }

  await targetConn.query('SET FOREIGN_KEY_CHECKS = 1');

  await sourceConn.end();
  await targetConn.end();

  console.log('\n=== Resumen de migracion ===');
  results.forEach(r => console.log(`${r.table}: ${r.rows} filas`));
  if (failures.length > 0) {
    console.log('\nTablas con errores:');
    failures.forEach(f => console.log(`${f.table}: ${f.error}`));
    process.exitCode = 1;
  } else {
    console.log('\nMigracion completada sin errores.');
  }
}

main().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});
