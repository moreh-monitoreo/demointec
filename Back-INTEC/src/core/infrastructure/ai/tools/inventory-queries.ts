import { reportsPool } from '../../../../config/db-reports';
import { AiTool } from './types';

export const inventoryTools: AiTool[] = [
    {
        name: 'inventario_asignado',
        description: 'Lista articulos de inventario (herramientas, uniformes, equipo) actualmente asignados a empleados. Puede filtrar por empleado.',
        parameters: {
            type: 'object',
            properties: {
                id_employee: { type: 'string', description: 'ID del empleado para filtrar sus asignaciones. Si se omite, trae todas las asignaciones activas.' },
            },
        },
        run: async (args) => {
            const params: any[] = [];
            let filter = '';
            if (args.id_employee) { filter = ' AND ia.id_employee = ?'; params.push(args.id_employee); }
            const [rows] = await reportsPool.query(
                `SELECT ia.id_employee, e.name_employee AS nombre_empleado, i.name_inventory AS articulo,
                        i.category AS categoria, ia.quantity AS cantidad, ia.assignment_date AS fecha_asignacion, ia.state AS estado
                 FROM inventory_assignments ia
                 JOIN inventory i ON i.id_inventory = ia.id_inventory
                 LEFT JOIN employees e ON e.id_employee = ia.id_employee
                 WHERE ia.status = 1${filter}
                 ORDER BY ia.assignment_date DESC
                 LIMIT 200`,
                params
            );
            return rows as any[];
        },
    },
    {
        name: 'inventario_disponible_por_categoria',
        description: 'Cuenta articulos de inventario por categoria y estado (Disponible, Asignado, etc). Util para preguntas de stock de herramientas, uniformes o equipo.',
        parameters: {
            type: 'object',
            properties: {
                categoria: { type: 'string', description: 'Filtra por una categoria especifica. Si se omite, trae todas.' },
            },
        },
        run: async (args) => {
            const params: any[] = [];
            let filter = '';
            if (args.categoria) { filter = ' AND category = ?'; params.push(args.categoria); }
            const [rows] = await reportsPool.query(
                `SELECT category AS categoria, state AS estado, COUNT(*) AS articulos, SUM(quantity) AS cantidad_total
                 FROM inventory
                 WHERE status = 1${filter}
                 GROUP BY category, state
                 ORDER BY categoria`,
                params
            );
            return rows as any[];
        },
    },
];
