import { Request, Response } from 'express';
import { InventoryCategoryRepository } from '../../../domain/repository/inventory-category.repository';
import { InventoryCategoryEntity } from '../../entity/inventory-category.entity';

export class InventoryCategoryController {
  constructor(private categoryRepository: InventoryCategoryRepository<InventoryCategoryEntity>) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      await this.categoryRepository.create(req.body);
      res.status(200).json({ message: 'Categoría creada correctamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al crear la categoría', error });
    }
  }

  async list(req: Request, res: Response): Promise<void> {
    try {
      const items = await this.categoryRepository.list();
      res.status(200).json(items);
    } catch (error) {
      res.status(500).json({ message: 'Error al listar categorías', error });
    }
  }

  async get(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const item = await this.categoryRepository.get(Number(id));
      res.status(200).json(item);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener la categoría', error });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.categoryRepository.update(Number(id), req.body);
      res.status(200).json({ message: 'Categoría actualizada correctamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar la categoría', error });
    }
  }

  async remove(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.categoryRepository.remove(Number(id));
      res.status(200).json({ message: 'Categoría eliminada correctamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al eliminar la categoría', error });
    }
  }
}
