import { Query, Id } from "../../domain/repository/loan_request.repository";
import database from "../../../config/db";
import { NotFound } from "http-errors";
import { LoanRequestRepository } from "../../domain/repository/loan_request.repository";
import { LoanRequestEntity } from "../entity/loan_request.entity";

export class LoanRequestAdapterRepository implements LoanRequestRepository<LoanRequestEntity> {

  async create(data: Partial<LoanRequestEntity> | Partial<LoanRequestEntity>[]): Promise<LoanRequestEntity | LoanRequestEntity[]> {
    const repository = database.getRepository(LoanRequestEntity);
    const results: LoanRequestEntity[] = [];

    const dataArray = Array.isArray(data) ? data : [data];

    for (const item of dataArray) {
      const entity = repository.create(item);
      await repository.save(entity);
      results.push(entity);
    }

    return Array.isArray(data) ? results : results[0];
  }

  async list(query?: Query): Promise<LoanRequestEntity[]> {
    const repository = database.getRepository(LoanRequestEntity);
    return repository.find();
  }

  async get(id: Id, query?: Query): Promise<LoanRequestEntity> {
    const repository = database.getRepository(LoanRequestEntity);
    const data = await repository.findOne({
      where: { id_loan: id as string },
    });
    if (!data) {
      throw new NotFound('No existe el préstamo con el id proporcionado');
    }
    return data;
  }

  async update(data: Partial<LoanRequestEntity> | Partial<LoanRequestEntity>[], query?: Query): Promise<LoanRequestEntity | LoanRequestEntity[]> {
    const repository = database.getRepository(LoanRequestEntity);
    const updated: LoanRequestEntity[] = [];

    const dataArray = Array.isArray(data) ? data : [data];

    for (const item of dataArray) {
      if (!item.id_loan) {
        throw new Error('Cada préstamo debe tener id_loan para poder actualizar');
      }
      await repository.update({ id_loan: item.id_loan }, item);
      const result = await this.get(item.id_loan);
      updated.push(result);
    }

    return Array.isArray(data) ? updated : updated[0];
  }

  async remove(id: Id, query?: Query): Promise<LoanRequestEntity> {
    const repository = database.getRepository(LoanRequestEntity);
    const data = await this.get(id, query);
    await repository.update({ id_loan: id.toString() }, { status: false });
    return data;
  }
}
