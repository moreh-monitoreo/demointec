import { reportsPool } from '../../../../config/db-reports';
import { AiTool } from './types';

export const payrollTools: AiTool[] = [
    {
        name: 'costo_salario_base_por_puesto',
        description: 'Suma y promedia el salario base registrado en el expediente de cada empleado activo (campo base_salary), agrupado por puesto. Util para preguntas de costo de nomina o comparativos salariales por puesto. Aclara siempre que es el salario base registrado en el sistema, no incluye bonos ni prestaciones.',
        parameters: {
            type: 'object',
            properties: {
                puesto: { type: 'string', description: 'Filtra por un puesto especifico (texto exacto como esta en el sistema). Si se omite, trae todos los puestos.' },
            },
        },
        run: async (args) => {
            const params: any[] = [];
            let filter = '';
            if (args.puesto) { filter = ' AND position = ?'; params.push(args.puesto); }
            const [rows] = await reportsPool.query(
                `SELECT position AS puesto, COUNT(*) AS empleados,
                        SUM(base_salary) AS suma_salario_base, ROUND(AVG(base_salary), 2) AS promedio_salario_base
                 FROM employees
                 WHERE status = 1 AND base_salary IS NOT NULL${filter}
                 GROUP BY position
                 ORDER BY suma_salario_base DESC`,
                params
            );
            return rows as any[];
        },
    },
    {
        name: 'tabulador_salarios',
        description: 'Consulta el tabulador oficial de salarios semanales por puesto y zona geografica (referencia, no es el salario individual de cada empleado).',
        parameters: {
            type: 'object',
            properties: {
                puesto: { type: 'string', description: 'Filtra por un puesto especifico. Si se omite, trae todo el tabulador.' },
            },
        },
        run: async (args) => {
            const params: any[] = [];
            let filter = '';
            if (args.puesto) { filter = ' WHERE position = ?'; params.push(args.puesto); }
            const [rows] = await reportsPool.query(
                `SELECT position AS puesto, geographic_zone AS zona_geografica, weekly_salary AS salario_semanal
                 FROM salary_tabulators${filter}
                 ORDER BY position`,
                params
            );
            return rows as any[];
        },
    },
];
