import { Query, Id } from "../../domain/repository/bond_recommendation.repository";
import database from "../../../config/db";
import { NotFound } from "http-errors";
import { BondRecommendationRepository } from "../../domain/repository/bond_recommendation.repository";
import { BondRecommendationEntity } from "../entity/bond_recommendation.entity";

export class BondRecommendationAdapterRepository implements BondRecommendationRepository<BondRecommendationEntity> {

  async create(data: Partial<BondRecommendationEntity> | Partial<BondRecommendationEntity>[]): Promise<BondRecommendationEntity | BondRecommendationEntity[]> {
    const repository = database.getRepository(BondRecommendationEntity);
    const results: BondRecommendationEntity[] = [];

    const dataArray = Array.isArray(data) ? data : [data];

    for (const item of dataArray) {
      const entity = repository.create(item);
      await repository.save(entity);
      results.push(entity);
    }

    return Array.isArray(data) ? results : results[0];
  }

  async list(query?: Query): Promise<BondRecommendationEntity[]> {
    const repository = database.getRepository(BondRecommendationEntity);
    return repository.find();
  }

  async get(id: Id, query?: Query): Promise<BondRecommendationEntity> {
    const repository = database.getRepository(BondRecommendationEntity);
    const data = await repository.findOne({
      where: { id_bond_rec: id as string },
    });
    if (!data) {
      throw new NotFound('No existe el bono con el id proporcionado');
    }
    return data;
  }

  async update(data: Partial<BondRecommendationEntity> | Partial<BondRecommendationEntity>[], query?: Query): Promise<BondRecommendationEntity | BondRecommendationEntity[]> {
    const repository = database.getRepository(BondRecommendationEntity);
    const updated: BondRecommendationEntity[] = [];

    const dataArray = Array.isArray(data) ? data : [data];

    for (const item of dataArray) {
      if (!item.id_bond_rec) {
        throw new Error('Cada bono debe tener id_bond_rec para poder actualizar');
      }
      await repository.update({ id_bond_rec: item.id_bond_rec }, item);
      const result = await this.get(item.id_bond_rec);
      updated.push(result);
    }

    return Array.isArray(data) ? updated : updated[0];
  }

  async remove(id: Id, query?: Query): Promise<BondRecommendationEntity> {
    const repository = database.getRepository(BondRecommendationEntity);
    const data = await this.get(id, query);
    await repository.update({ id_bond_rec: id.toString() }, { status: false });
    return data;
  }
}
