import { Request, Response } from "express";
import { VacationAdjustmentAdapter } from "../../adapters/vacation-adjustment.adapter";

export class VacationAdjustmentController {
    constructor(private adapter: VacationAdjustmentAdapter) { }

    async list(req: Request, res: Response): Promise<void> {
        try {
            const adjustments = await this.adapter.list();
            res.status(200).json(adjustments);
        } catch (error: any) {
            console.error('[VACATION ADJUSTMENT LIST ERROR]', error?.sqlMessage || error?.message || error);
            res.status(500).json({ message: 'Error al listar ajustes de vacaciones', error: error?.sqlMessage || error?.message });
        }
    }

    async upsert(req: Request, res: Response): Promise<void> {
        try {
            const { id_employee, year, base_days } = req.body;
            if (!id_employee || year === undefined || base_days === undefined) {
                res.status(400).json({ message: "Faltan datos requeridos (id_employee, year, base_days)" });
                return;
            }
            const result = await this.adapter.upsert({ id_employee, year: Number(year), base_days: Number(base_days) });
            res.status(200).json(result);
        } catch (error: any) {
            console.error('[VACATION ADJUSTMENT UPSERT ERROR]', error?.sqlMessage || error?.message || error);
            res.status(500).json({ message: 'Error al guardar ajuste de vacaciones', error: error?.sqlMessage || error?.message });
        }
    }
}
