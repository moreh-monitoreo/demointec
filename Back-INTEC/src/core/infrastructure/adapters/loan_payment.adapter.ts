import { Query, Id } from "../../domain/repository/loan_payment.repository";
import database from "../../../config/db";
import { NotFound } from "http-errors";
import { LoanPaymentRepository } from "../../domain/repository/loan_payment.repository";
import { LoanPaymentEntity } from "../entity/loan_payment.entity";

export class LoanPaymentAdapterRepository implements LoanPaymentRepository<LoanPaymentEntity> {

  async create(data: Partial<LoanPaymentEntity> | Partial<LoanPaymentEntity>[]): Promise<LoanPaymentEntity | LoanPaymentEntity[]> {
    const repository = database.getRepository(LoanPaymentEntity);
    const results: LoanPaymentEntity[] = [];

    const dataArray = Array.isArray(data) ? data : [data];

    for (const item of dataArray) {
      const entity = repository.create(item);
      await repository.save(entity);
      results.push(entity);
    }

    return Array.isArray(data) ? results : results[0];
  }

  async list(query?: Query): Promise<LoanPaymentEntity[]> {
    const repository = database.getRepository(LoanPaymentEntity);
    return repository.find();
  }

  async get(id: Id, query?: Query): Promise<LoanPaymentEntity> {
    const repository = database.getRepository(LoanPaymentEntity);
    const data = await repository.findOne({
      where: { id_payment: id as string },
    });
    if (!data) {
      throw new NotFound('No existe el pago con el id proporcionado');
    }
    return data;
  }

  async getByLoan(id_loan: string, query?: Query): Promise<LoanPaymentEntity[]> {
    const repository = database.getRepository(LoanPaymentEntity);
    return repository.find({ where: { id_loan } });
  }

  async update(data: Partial<LoanPaymentEntity> | Partial<LoanPaymentEntity>[], query?: Query): Promise<LoanPaymentEntity | LoanPaymentEntity[]> {
    const repository = database.getRepository(LoanPaymentEntity);
    const updated: LoanPaymentEntity[] = [];

    const dataArray = Array.isArray(data) ? data : [data];

    for (const item of dataArray) {
      if (!item.id_payment) {
        throw new Error('Cada pago debe tener id_payment para poder actualizar');
      }
      await repository.update({ id_payment: item.id_payment }, item);
      const result = await this.get(item.id_payment);
      updated.push(result);
    }

    return Array.isArray(data) ? updated : updated[0];
  }

  async remove(id: Id, query?: Query): Promise<LoanPaymentEntity> {
    const repository = database.getRepository(LoanPaymentEntity);
    const data = await this.get(id, query);
    await repository.update({ id_payment: id.toString() }, { status: false });
    return data;
  }
}
