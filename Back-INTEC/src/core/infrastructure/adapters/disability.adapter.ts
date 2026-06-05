import { DisabilityRepository, Query, Id } from "../../domain/repository/disability.repository";
import { DisabilityEntity } from "../entity/disability.entity";
import database from "../../../config/db";
import { NotFound } from "http-errors";

export class DisabilityAdapterRepository implements DisabilityRepository<DisabilityEntity> {

    // Convierte cadenas vacías de campos de fecha a null (MySQL DATE no acepta '')
    private sanitize(data: Partial<DisabilityEntity>): Partial<DisabilityEntity> {
        const dateFields: (keyof DisabilityEntity)[] = ['start_date', 'end_date', 'return_to_work_date'];
        const clean: any = { ...data };
        for (const f of dateFields) {
            if (clean[f] === '' || clean[f] === undefined) clean[f] = null;
        }
        return clean;
    }

    async create(data: Partial<DisabilityEntity>, query?: Query): Promise<DisabilityEntity> {
        const repository = database.getRepository(DisabilityEntity);
        const disability = repository.create(this.sanitize(data));
        await repository.save(disability);
        return disability;
    }

    async list(query?: Query): Promise<DisabilityEntity[]> {
        const repository = database.getRepository(DisabilityEntity);
        return repository.find({
            relations: ['employee'],
            order: { created_at: 'DESC' }
        });
    }

    async get(id: Id, query?: Query): Promise<DisabilityEntity> {
        const repository = database.getRepository(DisabilityEntity);
        const data = await repository.findOne({
            where: { id: id as number },
            relations: ['employee']
        });
        if (!data) {
            throw new NotFound("No existe la incapacidad con el id proporcionado");
        }
        return data;
    }

    async update(id: Id, data: Partial<DisabilityEntity>, query?: Query): Promise<DisabilityEntity> {
        const repository = database.getRepository(DisabilityEntity);
        await repository.update(id, this.sanitize(data));
        return this.get(id);
    }

    async remove(id: Id, query?: Query): Promise<DisabilityEntity> {
        const repository = database.getRepository(DisabilityEntity);
        const disability = await this.get(id);
        await repository.delete(id);
        return disability;
    }
}
