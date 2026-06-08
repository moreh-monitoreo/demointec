import database from "../../../config/db";
import { VacationAdjustmentEntity } from "../entity/vacation-adjustment.entity";

export class VacationAdjustmentAdapter {
    async list(): Promise<VacationAdjustmentEntity[]> {
        const repository = database.getRepository(VacationAdjustmentEntity);
        return repository.find();
    }

    // Guarda o actualiza el ajuste de un empleado para un año (único por id_employee + year)
    async upsert(data: Partial<VacationAdjustmentEntity>): Promise<VacationAdjustmentEntity> {
        const repository = database.getRepository(VacationAdjustmentEntity);
        const existing = await repository.findOne({
            where: { id_employee: data.id_employee, year: data.year }
        });
        if (existing) {
            existing.base_days = data.base_days as number;
            return repository.save(existing);
        }
        const created = repository.create(data);
        return repository.save(created);
    }
}
