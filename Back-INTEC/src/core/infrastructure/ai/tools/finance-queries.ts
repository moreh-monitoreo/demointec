import { reportsPool } from '../../../../config/db-reports';
import { AiTool, resolveDateRange } from './types';

export const financeTools: AiTool[] = [
    {
        name: 'prestamos_resumen',
        description: 'Resume las solicitudes de prestamos a empleados en un rango de fechas (aprobados): cantidad, monto solicitado y monto autorizado.',
        parameters: {
            type: 'object',
            properties: {
                fecha_inicio: { type: 'string', description: 'Fecha inicio del periodo (compara contra fecha de aprobacion), formato YYYY-MM-DD. Si se omite, ultimos 12 meses.' },
                fecha_fin: { type: 'string', description: 'Fecha fin del periodo, formato YYYY-MM-DD. Si se omite, hoy.' },
            },
        },
        run: async (args) => {
            const { start, end } = resolveDateRange(args.fecha_inicio, args.fecha_fin);
            const [rows] = await reportsPool.query(
                `SELECT COUNT(*) AS solicitudes, SUM(requested_amount) AS monto_solicitado, SUM(authorized_amount) AS monto_autorizado
                 FROM loan_requests
                 WHERE STR_TO_DATE(approval_date, '%d/%m/%Y') BETWEEN ? AND ?`,
                [start, end]
            );
            return rows as any[];
        },
    },
    {
        name: 'bonos_resumen',
        description: 'Resume las solicitudes de bonos a empleados en un rango de fechas: cantidad y monto total.',
        parameters: {
            type: 'object',
            properties: {
                fecha_inicio: { type: 'string', description: 'Fecha inicio del periodo (compara contra fecha de pago), formato YYYY-MM-DD. Si se omite, ultimos 12 meses.' },
                fecha_fin: { type: 'string', description: 'Fecha fin del periodo, formato YYYY-MM-DD. Si se omite, hoy.' },
            },
        },
        run: async (args) => {
            const { start, end } = resolveDateRange(args.fecha_inicio, args.fecha_fin);
            const [rows] = await reportsPool.query(
                `SELECT COUNT(*) AS solicitudes, SUM(bond_amount) AS monto_total
                 FROM bond_applications
                 WHERE STR_TO_DATE(payment_date, '%d/%m/%Y') BETWEEN ? AND ?`,
                [start, end]
            );
            return rows as any[];
        },
    },
];
