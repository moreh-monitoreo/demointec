/**
 * Script de importacion de empleados desde Excel a MySQL.
 *
 * Uso:
 *   node scripts/import-employees.js
 *
 * Requiere:
 *   - xlsx (npm install xlsx)
 *   - mysql2 (ya incluido en el proyecto)
 *   - dotenv (ya incluido en el proyecto)
 *
 * El archivo Excel debe estar en: public/formatos/BASE DE DATOS ACTIVOS.xlsx
 *
 * Columnas procesadas:
 *   A-BB  → tabla employees
 *   BI-CK → tabla employee_uniforms
 */

'use strict';

const XLSX = require('xlsx');
const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const EXCEL_PATH = path.join(__dirname, '../public/formatos/BASE DE DATOS ACTIVOS.xlsx');

// Convierte numero serial de Excel a string YYYY-MM-DD
function excelDateToStr(serial) {
  if (!serial || typeof serial !== 'number') return null;
  const d = XLSX.SSF.parse_date_code(serial);
  if (!d) return null;
  return `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}`;
}

// Convierte cualquier valor de fecha (numero serial o string) a string
function toDateStr(val) {
  if (!val) return null;
  if (typeof val === 'number') return excelDateToStr(val);
  return String(val).trim() || null;
}

// Limpia string, retorna null si vacio
function toStr(val) {
  if (val === null || val === undefined) return null;
  const s = String(val).trim();
  return s === '' ? null : s;
}

// Convierte a entero
function toInt(val) {
  if (val === null || val === undefined) return null;
  const n = parseInt(val, 10);
  return isNaN(n) ? null : n;
}

// Convierte a decimal
function toDecimal(val) {
  if (val === null || val === undefined) return null;
  const n = parseFloat(val);
  return isNaN(n) ? null : n;
}

// Genera un ID de empleado unico a partir del codigo
function buildEmployeeId(code) {
  if (!code) return null;
  return `EMP-${String(code).trim()}`;
}

async function main() {
  // Leer Excel
  console.log('Leyendo archivo Excel...');
  const wb = XLSX.readFile(EXCEL_PATH);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });

  // La fila 0 es el encabezado, la fila 1 es la leyenda de bonos (ignorar)
  // Los datos reales empiezan en la fila 2 (indice 2)
  // Se filtran filas sin nombre (IDs pre-cargados como plantilla vacía)
  const dataRows = rows.slice(2).filter(row =>
    row && row[0] && row[0] !== 'ID' && row[1] && String(row[1]).trim() !== ''
  );

  console.log(`Filas de empleados encontradas: ${dataRows.length}`);

  // Conectar a MySQL
  console.log('Conectando a MySQL...');
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false },
  });

  console.log('Conexion establecida.');

  let employeesInserted = 0;
  let employeesUpdated = 0;
  let uniformsInserted = 0;
  let uniformsUpdated = 0;
  let errors = 0;

  for (const row of dataRows) {
    // ── Mapeo columnas A-BB a employees ──────────────────────────────────────

    const employeeCode = toStr(row[0]);  // A: ID
    if (!employeeCode) continue;

    const id_employee = buildEmployeeId(employeeCode);

    // Nombre
    const name_employee = toStr(row[1]);  // B: NOMBRE

    // Fechas
    const admission_date = toDateStr(row[2]);  // C: FECHA DE INGRESO

    // Puesto y ubicacion
    const position = toStr(row[3]);   // D: PUESTO
    const location = toStr(row[4]);   // E: UBICACION

    // Salario base
    const base_salary = toDecimal(row[5]);  // F: SUELDO

    // Datos personales
    const gender = toStr(row[7]);         // H: SEXO
    const age = toInt(row[8]);            // I: EDAD
    const marital_status = toStr(row[9]); // J: EDO. CIVIL
    const education_level = toStr(row[10]); // K: NIVEL DE ESTUDIOS
    const email = toStr(row[11]);         // L: CORREO @
    const phone = toStr(row[12]);         // M: CEL
    const ine_code = toStr(row[13]);      // N: INE

    // Domicilio
    const street = toStr(row[14]);         // O: DOMICILIO
    const outdoor_number = toStr(row[15]); // P: N#
    const interior_number = toStr(row[16]);// Q: INTERIOR
    const colony = toStr(row[17]);         // R: COLONIA
    const city = toStr(row[18]);           // S: CIUDAD
    const state = toStr(row[19]);          // T: ESTADO
    const zip_code = toStr(row[20]);       // U: C.P.

    // Nacimiento
    const birth_place = toStr(row[21]);    // V: LUGAR DE NACIMIENTO
    const birth_date = toDateStr(row[22]); // W: FECHA DE NACIMIENTO

    // Identificaciones
    const nss = toStr(row[23]);   // X: NSS
    const rfc = toStr(row[24]);   // Y: RFC
    const curp = toStr(row[25]);  // Z: CURP

    // Hijos
    const children_count = toInt(row[26]);       // AA: HIJOS
    const child1_name = toStr(row[27]);           // AB: HIJO 1
    const child1_birth_date = toDateStr(row[28]); // AC: NAC
    const child2_name = toStr(row[29]);           // AD: HIJO 2
    const child2_birth_date = toDateStr(row[30]); // AE: NAC
    const child3_name = toStr(row[31]);           // AF: HIJO 3
    const child3_birth_date = toDateStr(row[32]); // AG: NAC
    const child4_name = toStr(row[33]);           // AH: HIJO 4
    const child4_birth_date = toDateStr(row[34]); // AI: NAC
    const child5_name = toStr(row[35]);           // AJ: HIJO 5
    const child5_birth_date = toDateStr(row[36]); // AK: NAC

    // Contrato IMSS
    const imss_registration_date = toDateStr(row[37]); // AL: FECHA DE INICIO
    const contract_expiration = toDateStr(row[38]);     // AM: FECHA DE TERMINO

    // row[39] = AN: FIRMA (no se mapea)
    // row[40] = AO: TIPO (contrato tipo — se mapea a contract_type)
    const contract_type = toStr(row[40]); // AO: TIPO

    // Beneficiarios
    const beneficiary = toStr(row[41]);              // AP: BENEFICIARIO
    const beneficiary_relationship = toStr(row[42]); // AQ: PARENTESCO
    const beneficiary_percentage = toStr(row[43]);   // AR: %

    // Infonavit — row[44] = AS (SI/NO), row[45] = AT: FACTOR, row[46] = AU: NO CREDITO
    const infonavit_factor = toStr(row[45]);         // AT: FACTOR
    const infonavit_credit_number = toStr(row[46]);  // AU: NO CREDITO

    // Salud
    const blood_type = toStr(row[47]);  // AV: TIPO DE SANGRE
    const weight = toStr(row[48]);      // AW: PESO
    const height = toStr(row[49]);      // AX: ESTATURA

    // Emergencia
    const emergency_phone = toStr(row[50]);                    // AY: TEL DE EMERGENCIA
    const emergency_contact_name = toStr(row[51]);             // AZ: CONTACTO DE EMERGENCIA
    const emergency_contact_relationship = toStr(row[52]);     // BA: PARENTESCO (emergencia)
    const allergies = toStr(row[53]);                          // BB: ALERGIAS

    // Email unico: si no hay, usamos el ID como placeholder para evitar conflictos
    const emailFinal = email || `${id_employee}@sin-correo.local`;

    const employeeData = {
      id_employee,
      name_employee: name_employee || '',
      employee_code: employeeCode,
      email: emailFinal,
      phone: phone || '',
      role: 'empleado',
      admission_date,
      imss_registration_date,
      position,
      location,
      entry_time: null,
      exit_time: null,
      gender,
      age,
      marital_status,
      education_level,
      ine_code,
      street,
      outdoor_number,
      interior_number,
      colony,
      zip_code,
      city,
      state,
      birth_place,
      birth_date,
      nss,
      rfc,
      curp,
      children_count,
      child1_name,
      child1_birth_date,
      child2_name,
      child2_birth_date,
      child3_name,
      child3_birth_date,
      child4_name,
      child4_birth_date,
      child5_name,
      child5_birth_date,
      beneficiary,
      beneficiary_relationship,
      beneficiary_percentage,
      infonavit_factor,
      infonavit_credit_number,
      blood_type,
      weight,
      height,
      emergency_phone,
      emergency_contact_name,
      emergency_contact_relationship,
      allergies,
      contract_expiration,
      contract_type,
      base_salary,
      status: true,
    };

    // ── Upsert employee ───────────────────────────────────────────────────────
    try {
      const [existing] = await connection.execute(
        'SELECT id_employee FROM employees WHERE id_employee = ?',
        [id_employee]
      );

      if (existing.length > 0) {
        // UPDATE
        await connection.execute(
          `UPDATE employees SET
            name_employee = ?, employee_code = ?, email = ?, phone = ?, role = ?,
            admission_date = ?, imss_registration_date = ?, position = ?, location = ?,
            gender = ?, age = ?, marital_status = ?, education_level = ?,
            ine_code = ?, street = ?, outdoor_number = ?, interior_number = ?,
            colony = ?, zip_code = ?, city = ?, state = ?,
            birth_place = ?, birth_date = ?,
            nss = ?, rfc = ?, curp = ?,
            children_count = ?,
            child1_name = ?, child1_birth_date = ?,
            child2_name = ?, child2_birth_date = ?,
            child3_name = ?, child3_birth_date = ?,
            child4_name = ?, child4_birth_date = ?,
            child5_name = ?, child5_birth_date = ?,
            beneficiary = ?, beneficiary_relationship = ?, beneficiary_percentage = ?,
            infonavit_factor = ?, infonavit_credit_number = ?,
            blood_type = ?, weight = ?, height = ?,
            emergency_phone = ?, emergency_contact_name = ?, emergency_contact_relationship = ?,
            allergies = ?, contract_expiration = ?, contract_type = ?,
            base_salary = ?, status = ?
          WHERE id_employee = ?`,
          [
            employeeData.name_employee, employeeData.employee_code, employeeData.email,
            employeeData.phone, employeeData.role,
            employeeData.admission_date, employeeData.imss_registration_date,
            employeeData.position, employeeData.location,
            employeeData.gender, employeeData.age, employeeData.marital_status,
            employeeData.education_level, employeeData.ine_code,
            employeeData.street, employeeData.outdoor_number, employeeData.interior_number,
            employeeData.colony, employeeData.zip_code, employeeData.city, employeeData.state,
            employeeData.birth_place, employeeData.birth_date,
            employeeData.nss, employeeData.rfc, employeeData.curp,
            employeeData.children_count,
            employeeData.child1_name, employeeData.child1_birth_date,
            employeeData.child2_name, employeeData.child2_birth_date,
            employeeData.child3_name, employeeData.child3_birth_date,
            employeeData.child4_name, employeeData.child4_birth_date,
            employeeData.child5_name, employeeData.child5_birth_date,
            employeeData.beneficiary, employeeData.beneficiary_relationship,
            employeeData.beneficiary_percentage,
            employeeData.infonavit_factor, employeeData.infonavit_credit_number,
            employeeData.blood_type, employeeData.weight, employeeData.height,
            employeeData.emergency_phone, employeeData.emergency_contact_name,
            employeeData.emergency_contact_relationship,
            employeeData.allergies, employeeData.contract_expiration, employeeData.contract_type,
            employeeData.base_salary, employeeData.status,
            id_employee,
          ]
        );
        employeesUpdated++;
      } else {
        // INSERT
        await connection.execute(
          `INSERT INTO employees (
            id_employee, name_employee, employee_code, email, phone, role,
            admission_date, imss_registration_date, position, location,
            gender, age, marital_status, education_level,
            ine_code, street, outdoor_number, interior_number,
            colony, zip_code, city, state,
            birth_place, birth_date,
            nss, rfc, curp,
            children_count,
            child1_name, child1_birth_date,
            child2_name, child2_birth_date,
            child3_name, child3_birth_date,
            child4_name, child4_birth_date,
            child5_name, child5_birth_date,
            beneficiary, beneficiary_relationship, beneficiary_percentage,
            infonavit_factor, infonavit_credit_number,
            blood_type, weight, height,
            emergency_phone, emergency_contact_name, emergency_contact_relationship,
            allergies, contract_expiration, contract_type,
            base_salary, status
          ) VALUES (
            ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?,
            ?, ?, ?, ?,
            ?, ?, ?, ?,
            ?, ?, ?, ?,
            ?, ?,
            ?, ?, ?,
            ?,
            ?, ?,
            ?, ?,
            ?, ?,
            ?, ?,
            ?, ?,
            ?, ?, ?,
            ?, ?,
            ?, ?, ?,
            ?, ?, ?,
            ?, ?, ?,
            ?, ?
          )`,
          [
            employeeData.id_employee, employeeData.name_employee, employeeData.employee_code,
            employeeData.email, employeeData.phone, employeeData.role,
            employeeData.admission_date, employeeData.imss_registration_date,
            employeeData.position, employeeData.location,
            employeeData.gender, employeeData.age, employeeData.marital_status,
            employeeData.education_level, employeeData.ine_code,
            employeeData.street, employeeData.outdoor_number, employeeData.interior_number,
            employeeData.colony, employeeData.zip_code, employeeData.city, employeeData.state,
            employeeData.birth_place, employeeData.birth_date,
            employeeData.nss, employeeData.rfc, employeeData.curp,
            employeeData.children_count,
            employeeData.child1_name, employeeData.child1_birth_date,
            employeeData.child2_name, employeeData.child2_birth_date,
            employeeData.child3_name, employeeData.child3_birth_date,
            employeeData.child4_name, employeeData.child4_birth_date,
            employeeData.child5_name, employeeData.child5_birth_date,
            employeeData.beneficiary, employeeData.beneficiary_relationship,
            employeeData.beneficiary_percentage,
            employeeData.infonavit_factor, employeeData.infonavit_credit_number,
            employeeData.blood_type, employeeData.weight, employeeData.height,
            employeeData.emergency_phone, employeeData.emergency_contact_name,
            employeeData.emergency_contact_relationship,
            employeeData.allergies, employeeData.contract_expiration, employeeData.contract_type,
            employeeData.base_salary, employeeData.status,
          ]
        );
        employeesInserted++;
      }
    } catch (err) {
      console.error(`Error en empleado ${id_employee} (${name_employee}):`, err.message);
      errors++;
      continue;
    }

    // ── Mapeo columnas BI-CK a employee_uniforms ─────────────────────────────
    // BI (60): TALLA — talla general de ropa
    // BJ (61): PLAYERAS — cantidad/talla de playeras
    // BK (62): COLOR — color playeras
    // BP (67): CHALECO — talla chaleco
    // BQ (68): COLOR — color chaleco
    // BV (73): CASCO — talla casco (usualmente UNICA)
    // BW (74): COLOR — color casco
    // BZ (77): LENTES — indica si tiene lentes (presente = true)
    // CA (78): COLOR — color lentes
    // CC (80): GUANTES — talla guantes
    // CD (81): COLOR — color guantes
    // CI (86): TAPONES AUDITIVOS — indica si tiene tapones (presente = true)
    // CK (88): BOTAS — talla botas
    // CL (89): COLOR — color botas

    const shirt_size = toStr(row[60]);   // BI: TALLA (talla de ropa general)
    const shirt_count = toStr(row[61]);  // BJ: PLAYERAS (cantidad)
    const shirt_color = toStr(row[62]);  // BK: COLOR playeras

    const vest_size = toStr(row[67]);    // BP: CHALECO
    const vest_color = toStr(row[68]);   // BQ: COLOR chaleco

    const helmet_size = toStr(row[73]);  // BV: CASCO
    const helmet_color = toStr(row[74]); // BW: COLOR casco

    const lenses_raw = toStr(row[77]);   // BZ: LENTES
    const glasses = lenses_raw !== null; // presente = tiene lentes
    const glasses_color = toStr(row[78]);// CA: COLOR lentes

    const gloves_size = toStr(row[80]);  // CC: GUANTES
    const gloves_color = toStr(row[81]); // CD: COLOR guantes

    const earplugs_raw = toStr(row[86]); // CI: TAPONES AUDITIVOS
    const earplugs = earplugs_raw !== null;

    const boots_size = toStr(row[88]);   // CK: BOTAS
    const boots_color = toStr(row[89]);  // CL: COLOR botas

    // vest_type combina talla y color del chaleco
    const vest_type = [vest_size, vest_color].filter(Boolean).join(' - ') || null;

    // gloves_type combina talla y color
    const gloves_type = [gloves_size, gloves_color].filter(Boolean).join(' - ') || null;

    // Si no hay ningun dato de uniforme, omitir
    const hasUniformData = shirt_size || shirt_count || vest_type || helmet_size ||
      helmet_color || glasses || gloves_type || earplugs || boots_size;

    if (!hasUniformData) continue;

    try {
      const [existingUniform] = await connection.execute(
        'SELECT id FROM employee_uniforms WHERE id_employee = ?',
        [id_employee]
      );

      const uniformNote = [
        shirt_size ? `Talla ropa: ${shirt_size}` : null,
        shirt_count ? `Playeras: ${shirt_count}` : null,
        shirt_color ? `Color playera: ${shirt_color}` : null,
        glasses_color ? `Color lentes: ${glasses_color}` : null,
      ].filter(Boolean).join(' | ') || null;

      if (existingUniform.length > 0) {
        await connection.execute(
          `UPDATE employee_uniforms SET
            vest_type = ?, helmet_color = ?, glasses = ?,
            gloves_type = ?, earplugs = ?, boots_size = ?, boots_color = ?
          WHERE id_employee = ?`,
          [
            vest_type,
            helmet_color || helmet_size,
            glasses ? 1 : 0,
            gloves_type,
            earplugs ? 1 : 0,
            boots_size,
            boots_color,
            id_employee,
          ]
        );
        uniformsUpdated++;
      } else {
        await connection.execute(
          `INSERT INTO employee_uniforms (
            id_employee, vest_type, helmet_color, glasses,
            gloves_type, earplugs, boots_size, boots_color
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id_employee,
            vest_type,
            helmet_color || helmet_size,
            glasses ? 1 : 0,
            gloves_type,
            earplugs ? 1 : 0,
            boots_size,
            boots_color,
          ]
        );
        uniformsInserted++;
      }
    } catch (err) {
      console.error(`Error en uniforme de ${id_employee}:`, err.message);
      errors++;
    }
  }

  await connection.end();

  console.log('\n=== Resumen de importacion ===');
  console.log(`Empleados insertados : ${employeesInserted}`);
  console.log(`Empleados actualizados: ${employeesUpdated}`);
  console.log(`Uniformes insertados : ${uniformsInserted}`);
  console.log(`Uniformes actualizados: ${uniformsUpdated}`);
  console.log(`Errores              : ${errors}`);
}

main().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});
