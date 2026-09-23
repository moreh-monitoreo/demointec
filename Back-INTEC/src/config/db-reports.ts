import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

dotenv.config();

// Pool de solo lectura, separado del pool principal (db.ts).
// Usa credenciales de un usuario MySQL con permisos SELECT unicamente,
// para que el modulo de Reportes Ejecutivos con IA nunca pueda modificar datos.
export const reportsPool = mysql.createPool({
  host: process.env.DB_REPORTS_HOST || process.env.DB_HOST,
  port: parseInt(process.env.DB_REPORTS_PORT || process.env.DB_PORT || '3306', 10),
  user: process.env.DB_REPORTS_USER,
  password: process.env.DB_REPORTS_PASS,
  database: process.env.DB_REPORTS_NAME || process.env.DB_NAME,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
});

export default reportsPool;
