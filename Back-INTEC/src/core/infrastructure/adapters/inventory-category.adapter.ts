import { InventoryCategoryRepository, Id, Query } from '../../domain/repository/inventory-category.repository';
import { InventoryCategoryEntity } from '../entity/inventory-category.entity';
import database from '../../../config/db';
import { NotFound } from 'http-errors';

export class InventoryCategoryAdapterRepository implements InventoryCategoryRepository<InventoryCategoryEntity> {
  async create(data: Partial<InventoryCategoryEntity>, query?: Query): Promise<InventoryCategoryEntity> {
    const repository = database.getRepository(InventoryCategoryEntity);
    const item = repository.create({ ...data });
    await repository.save(item);
    return repository.findOneOrFail({ where: { id_category_inventory: item.id_category_inventory } });
  }

  async list(query?: Query): Promise<InventoryCategoryEntity[]> {
    const repository = database.getRepository(InventoryCategoryEntity);
    return repository.find({ where: { status: true } });
  }

  async get(id: Id, query?: Query): Promise<InventoryCategoryEntity> {
    const repository = database.getRepository(InventoryCategoryEntity);
    const item = await repository.findOne({ where: { id_category_inventory: id as number } });
    if (!item) throw new NotFound('No existe la categoría con el id proporcionado');
    return item;
  }

  async update(id: Id, data: Partial<InventoryCategoryEntity>, query?: Query): Promise<InventoryCategoryEntity> {
    const repository = database.getRepository(InventoryCategoryEntity);
    await repository.update({ id_category_inventory: id as number }, data);
    return this.get(id);
  }

  async remove(id: Id, query?: Query): Promise<InventoryCategoryEntity> {
    const repository = database.getRepository(InventoryCategoryEntity);
    const item = await this.get(id);
    await repository.update({ id_category_inventory: id as number }, { status: false });
    return item;
  }
}
