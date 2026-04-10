import { Query, Id } from "../../domain/repository/bond_application.repository";
import database from "../../../config/db";
import { NotFound } from "http-errors";
import { BondApplicationRepository } from "../../domain/repository/bond_application.repository";
import { BondApplicationEntity } from "../entity/bond_application.entity";

export class BondApplicationAdapterRepository implements BondApplicationRepository<BondApplicationEntity> {

  async create(data: Partial<BondApplicationEntity> | Partial<BondApplicationEntity>[]): Promise<BondApplicationEntity | BondApplicationEntity[]> {
    const repository = database.getRepository(BondApplicationEntity);
    const results: BondApplicationEntity[] = [];

    const dataArray = Array.isArray(data) ? data : [data];

    for (const item of dataArray) {
      const entity = repository.create(item);
      await repository.save(entity);
      results.push(entity);
    }

    return Array.isArray(data) ? results : results[0];
  }

  async list(query?: Query): Promise<BondApplicationEntity[]> {
    const repository = database.getRepository(BondApplicationEntity);
    return repository.find();
  }

  async get(id: Id, query?: Query): Promise<BondApplicationEntity> {
    const repository = database.getRepository(BondApplicationEntity);
    const data = await repository.findOne({
      where: { id_bond: id as string },
    });
    if (!data) {
      throw new NotFound('No existe el bono con el id proporcionado');
    }
    return data;
  }

  async update(data: Partial<BondApplicationEntity> | Partial<BondApplicationEntity>[], query?: Query): Promise<BondApplicationEntity | BondApplicationEntity[]> {
    const repository = database.getRepository(BondApplicationEntity);
    const updated: BondApplicationEntity[] = [];

    const dataArray = Array.isArray(data) ? data : [data];

    for (const item of dataArray) {
      if (!item.id_bond) {
        throw new Error('Cada bono debe tener id_bond para poder actualizar');
      }
      await repository.update({ id_bond: item.id_bond }, item);
      const result = await this.get(item.id_bond);
      updated.push(result);
    }

    return Array.isArray(data) ? updated : updated[0];
  }

  async remove(id: Id, query?: Query): Promise<BondApplicationEntity> {
    const repository = database.getRepository(BondApplicationEntity);
    const data = await this.get(id, query);
    await repository.update({ id_bond: id.toString() }, { status: false });
    return data;
  }
}
