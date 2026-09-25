import { reportsPool } from '../../../../config/db-reports';
import { AiTool } from './types';

export const inventoryTools: AiTool[] = [
    {
        name: 'inventario_asignado',
        description: 'Lista articulos del inventario de RRHH (herramientas, uniformes, equipo propio de la empresa) actualmente asignados a empleados. Puede filtrar por empleado. Si el usuario pregunta por un empleado especifico por nombre, primero usa buscar_empleado para obtener su id_employee y luego pasalo aqui. Esto es distinto del catalogo_materiales (materiales de construccion para proyectos/compras).',
        parameters: {
            type: 'object',
            properties: {
                id_employee: { type: 'string', description: 'id_employee interno del empleado (obtenido de buscar_empleado) para filtrar sus asignaciones. Si se omite, trae todas las asignaciones activas.' },
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
        description: 'Cuenta articulos del inventario de RRHH (herramientas, uniformes, equipo propio de la empresa) por categoria y estado (Disponible, Asignado, etc). No confundir con catalogo_materiales, que es el catalogo de materiales de construccion.',
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
    {
        name: 'catalogo_materiales',
        description: 'Consulta el catalogo de materiales de construccion (ej. instalaciones electricas, canalizacion, soporteria) usado para proyectos y compras. Puede buscar materiales por nombre, filtrar por categoria/subcategoria, o contar cuantos hay agrupados por categoria o subcategoria. Distinto del inventario_asignado (equipo de RRHH asignado a empleados).',
        parameters: {
            type: 'object',
            properties: {
                nombre: { type: 'string', description: 'Busca materiales cuyo nombre contenga este texto.' },
                categoria: { type: 'string', description: 'Filtra por categoria exacta (ej. "INSTALACIONES ELECTRICAS").' },
                subcategoria: { type: 'string', description: 'Filtra por subcategoria exacta (ej. "CANALIZACION").' },
                contar_por: { type: 'string', description: 'Si se da, en vez de listar materiales individuales agrupa el conteo por esta dimension.', enum: ['categoria', 'subcategoria'] },
            },
        },
        run: async (args) => {
            if (args.contar_por === 'categoria' || args.contar_por === 'subcategoria') {
                const column = args.contar_por === 'categoria' ? 'category' : 'subcategory';
                const [rows] = await reportsPool.query(
                    `SELECT ${column} AS grupo, COUNT(*) AS total FROM materials_catalog WHERE status = 1 GROUP BY ${column} ORDER BY total DESC`
                );
                return rows as any[];
            }
            const filters: string[] = ['status = 1'];
            const params: any[] = [];
            if (args.nombre) { filters.push('name_material LIKE ?'); params.push(`%${args.nombre}%`); }
            if (args.categoria) { filters.push('category = ?'); params.push(args.categoria); }
            if (args.subcategoria) { filters.push('subcategory = ?'); params.push(args.subcategoria); }
            const [rows] = await reportsPool.query(
                `SELECT name_material AS nombre, code AS codigo, c1 AS caracteristica_1, c2 AS caracteristica_2,
                        unit AS unidad, category AS categoria, subcategory AS subcategoria
                 FROM materials_catalog
                 WHERE ${filters.join(' AND ')}
                 ORDER BY name_material
                 LIMIT 50`,
                params
            );
            return rows as any[];
        },
    },
];
