import { AbsenceRequestRepository, Query, Id } from "../../domain/repository/absence-request.repository";
import { AbsenceRequestEntity } from "../entity/absence-request.entity";
import database from "../../../config/db";
import { NotFound } from "http-errors";

export class AbsenceRequestAdapterRepository implements AbsenceRequestRepository<AbsenceRequestEntity> {

    // Convierte cadenas vacías de campos de fecha a null (MySQL DATE no acepta '')
    private sanitize(data: Partial<AbsenceRequestEntity>): Partial<AbsenceRequestEntity> {
        const dateFields: (keyof AbsenceRequestEntity)[] = ['start_date', 'end_date', 'request_date', 'return_to_work_date'];
        const clean: any = { ...data };
        for (const f of dateFields) {
            if (clean[f] === '' || clean[f] === undefined) clean[f] = null;
        }
        if (clean.vacation_year === '' || clean.vacation_year === undefined) clean.vacation_year = null;
        return clean;
    }

    async create(data: Partial<AbsenceRequestEntity>, query?: Query): Promise<AbsenceRequestEntity> {
        const repository = database.getRepository(AbsenceRequestEntity);
        const absenceRequest = repository.create(this.sanitize(data));
        await repository.save(absenceRequest);
        return absenceRequest;
    }

    async list(query?: Query): Promise<AbsenceRequestEntity[]> {
        const repository = database.getRepository(AbsenceRequestEntity);
        return repository.find({
            relations: ['employee'],
            order: { request_date: 'DESC' }
        });
    }

    async get(id: Id, query?: Query): Promise<AbsenceRequestEntity> {
        const repository = database.getRepository(AbsenceRequestEntity);
        const data = await repository.findOne({
            where: { id: id as string },
            relations: ['employee']
        });
        if (!data) {
            throw new NotFound("No existe la solicitud con el id proporcionado");
        }
        return data;
    }

    async update(id: Id, data: Partial<AbsenceRequestEntity>, query?: Query): Promise<AbsenceRequestEntity> {
        const repository = database.getRepository(AbsenceRequestEntity);
        await repository.update(id, this.sanitize(data));
        return this.get(id);
    }

    async remove(id: Id, query?: Query): Promise<AbsenceRequestEntity> {
        const repository = database.getRepository(AbsenceRequestEntity);
        const absenceRequest = await this.get(id);
        await repository.delete(id);
        return absenceRequest;
    }
}
