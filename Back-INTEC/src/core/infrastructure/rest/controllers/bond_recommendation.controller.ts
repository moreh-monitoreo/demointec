import { config } from 'dotenv';
import { Request, Response } from "express";
import { BondRecommendationRepository } from '../../../domain/repository/bond_recommendation.repository';
import { BondRecommendationEntity } from '../../entity/bond_recommendation.entity';

config();

export class BondRecommendationController {
  constructor(private bondRepository: BondRecommendationRepository<BondRecommendationEntity>) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const body = req.body;
      await this.bondRepository.create(body);
      res.status(200).json({ message: 'Bono por recomendación registrado correctamente' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al registrar el bono por recomendación', error });
    }
  }

  async list(req: Request, res: Response): Promise<void> {
    try {
      const bonds = await this.bondRepository.list();
      res.status(200).json(bonds);
    } catch (error) {
      res.status(500).json({ message: 'Error al listar los bonos por recomendación', error });
    }
  }

  async get(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const bond = await this.bondRepository.get(id);
      res.status(200).json(bond);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener el bono por recomendación', error });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const body = req.body;
      await this.bondRepository.update(body);
      res.status(200).json({ message: 'Bono por recomendación actualizado correctamente' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al actualizar el bono por recomendación', error });
    }
  }

  async remove(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.bondRepository.remove(id);
      res.status(200).json({ message: 'Bono por recomendación eliminado correctamente' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al eliminar el bono por recomendación', error });
    }
  }
}
