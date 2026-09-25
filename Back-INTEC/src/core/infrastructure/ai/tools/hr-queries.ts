import { reportsPool } from '../../../../config/db-reports';
import { AiTool, resolveDateRange } from './types';

export const hrTools: AiTool[] = [
    {
        name: 'contar_empleados_activos',
        description: 'Cuenta empleados activos actualmente en la empresa. Puede agrupar por puesto o por ubicacion. Usalo para preguntas de headcount / cuantos empleados hay.',
        parameters: {
            type: 'object',
            properties: {
                agrupar_por: {
                    type: 'string',
                    description: 'Como agrupar el conteo. "ninguno" da el total general.',
                    enum: ['ninguno', 'puesto', 'ubicacion'],
                },
            },
        },
        run: async (args) => {
            if (args.agrupar_por !== 'puesto' && args.agrupar_por !== 'ubicacion') {
                const [rows] = await reportsPool.query('SELECT COUNT(*) AS total_empleados_activos FROM employees WHERE status = 1');
                return rows as any[];
            }
            const column = args.agrupar_por === 'puesto' ? 'position' : 'location';
            // location tiene variantes de captura para el mismo lugar (mayusculas, espacios, punto
            // final, y a veces con estado y a veces sin el, ej. "Guadalajara" / "GUADALAJARA, JAL"
            // / "GUADALAJARA, JALISCO."). Se agrupa solo por la ciudad (antes de la primera coma)
            // para unificarlas, ya que el estado se captura de forma inconsistente.
            const groupExpr = args.agrupar_por === 'ubicacion'
                ? `TRIM(SUBSTRING_INDEX(TRIM(TRAILING '.' FROM UPPER(TRIM(${column}))), ',', 1))`
                : column;
            const [rows] = await reportsPool.query(
                `SELECT ${groupExpr} AS grupo, COUNT(*) AS total FROM employees WHERE status = 1 AND ${column} IS NOT NULL AND ${column} <> '' GROUP BY ${groupExpr} ORDER BY total DESC`
            );
            return rows as any[];
        },
    },
    {
        name: 'altas_bajas_por_periodo',
        description: 'Cuenta altas (nuevos ingresos, por fecha de admision) y bajas (terminaciones, por ultimo dia laborado) mes a mes en un rango de fechas. Util para rotacion de personal, ingresos y egresos.',
        parameters: {
            type: 'object',
            properties: {
                fecha_inicio: { type: 'string', description: 'Fecha inicio del periodo, formato YYYY-MM-DD. Si se omite, se usan los ultimos 12 meses.' },
                fecha_fin: { type: 'string', description: 'Fecha fin del periodo, formato YYYY-MM-DD. Si se omite, se usa hoy.' },
            },
        },
        run: async (args) => {
            const { start, end } = resolveDateRange(args.fecha_inicio, args.fecha_fin);
            const [altas] = await reportsPool.query(
                `SELECT DATE_FORMAT(STR_TO_DATE(admission_date, '%Y-%m-%d'), '%Y-%m') AS mes, COUNT(*) AS altas
                 FROM employees
                 WHERE admission_date IS NOT NULL AND admission_date <> ''
                   AND STR_TO_DATE(admission_date, '%Y-%m-%d') BETWEEN ? AND ?
                 GROUP BY mes ORDER BY mes`,
                [start, end]
            );
            const [bajas] = await reportsPool.query(
                `SELECT DATE_FORMAT(last_work_day, '%Y-%m') AS mes, COUNT(*) AS bajas
                 FROM terminations
                 WHERE last_work_day BETWEEN ? AND ?
                 GROUP BY mes ORDER BY mes`,
                [start, end]
            );
            return [{ periodo: { desde: start, hasta: end }, altas_por_mes: altas, bajas_por_mes: bajas }];
        },
    },
    {
        name: 'tasa_rotacion',
        description: 'Calcula la tasa de rotacion de personal en un periodo: (numero de bajas / empleados activos actuales) x 100. Usalo para preguntas sobre rotacion de personal.',
        parameters: {
            type: 'object',
            properties: {
                fecha_inicio: { type: 'string', description: 'Fecha inicio del periodo, formato YYYY-MM-DD. Si se omite, se usan los ultimos 12 meses.' },
                fecha_fin: { type: 'string', description: 'Fecha fin del periodo, formato YYYY-MM-DD. Si se omite, se usa hoy.' },
            },
        },
        run: async (args) => {
            const { start, end } = resolveDateRange(args.fecha_inicio, args.fecha_fin);
            const [[bajasRow]]: any = await reportsPool.query(
                'SELECT COUNT(*) AS bajas FROM terminations WHERE last_work_day BETWEEN ? AND ?',
                [start, end]
            );
            const [[activosRow]]: any = await reportsPool.query('SELECT COUNT(*) AS activos FROM employees WHERE status = 1');
            const bajas = Number(bajasRow.bajas);
            const activos = Number(activosRow.activos);
            const tasa = activos > 0 ? Number(((bajas / activos) * 100).toFixed(2)) : null;
            return [{ periodo: { desde: start, hasta: end }, bajas_en_periodo: bajas, empleados_activos_actuales: activos, tasa_rotacion_pct: tasa }];
        },
    },
    {
        name: 'vacaciones_incapacidades_tomadas',
        description: 'Lista dias de vacaciones o incapacidad tomados (tabla de solicitudes de ausencia) en un rango de fechas, con totales por tipo. No calcula saldo de vacaciones pendientes, solo lo ya tomado y registrado.',
        parameters: {
            type: 'object',
            properties: {
                fecha_inicio: { type: 'string', description: 'Fecha inicio del periodo, formato YYYY-MM-DD. Si se omite, se usan los ultimos 12 meses.' },
                fecha_fin: { type: 'string', description: 'Fecha fin del periodo, formato YYYY-MM-DD. Si se omite, se usa hoy.' },
                tipo: { type: 'string', description: 'Filtra por tipo de ausencia. Si se omite, trae ambos tipos.', enum: ['Vacaciones', 'Incapacidad'] },
            },
        },
        run: async (args) => {
            const { start, end } = resolveDateRange(args.fecha_inicio, args.fecha_fin);
            const params: any[] = [start, end];
            let filter = '';
            if (args.tipo) { filter = ' AND ar.type = ?'; params.push(args.tipo); }
            const [rows] = await reportsPool.query(
                `SELECT ar.type AS tipo, COUNT(*) AS solicitudes, SUM(ar.days_count) AS dias_totales
                 FROM absence_requests ar
                 WHERE ar.start_date BETWEEN ? AND ?${filter}
                 GROUP BY ar.type`,
                params
            );
            return rows as any[];
        },
    },
    {
        name: 'incapacidades_detalle',
        description: 'Detalle de incapacidades medicas registradas (rama de seguro, tipo inicial/subsecuente, dias) agrupadas por mes en un rango de fechas.',
        parameters: {
            type: 'object',
            properties: {
                fecha_inicio: { type: 'string', description: 'Fecha inicio del periodo, formato YYYY-MM-DD. Si se omite, se usan los ultimos 12 meses.' },
                fecha_fin: { type: 'string', description: 'Fecha fin del periodo, formato YYYY-MM-DD. Si se omite, se usa hoy.' },
            },
        },
        run: async (args) => {
            const { start, end } = resolveDateRange(args.fecha_inicio, args.fecha_fin);
            const [rows] = await reportsPool.query(
                `SELECT DATE_FORMAT(start_date, '%Y-%m') AS mes, type AS tipo, insurance_branch AS rama_seguro,
                        COUNT(*) AS incapacidades, SUM(days) AS dias_totales
                 FROM disabilities
                 WHERE start_date BETWEEN ? AND ?
                 GROUP BY mes, type, insurance_branch
                 ORDER BY mes`,
                [start, end]
            );
            return rows as any[];
        },
    },
];
