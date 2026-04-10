import { config } from 'dotenv';
import { Request, Response } from "express";
import { BondApplicationRepository } from '../../../domain/repository/bond_application.repository';
import { BondApplicationEntity } from '../../entity/bond_application.entity';

config();

export class BondApplicationController {
  constructor(private bondRepository: BondApplicationRepository<BondApplicationEntity>) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const body = req.body;
      await this.bondRepository.create(body);
      res.status(200).json({ message: 'Bono por permanencia registrado correctamente' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al registrar el bono por permanencia', error });
    }
  }

  async list(req: Request, res: Response): Promise<void> {
    try {
      const bonds = await this.bondRepository.list();
      res.status(200).json(bonds);
    } catch (error) {
      res.status(500).json({ message: 'Error al listar los bonos por permanencia', error });
    }
  }

  async get(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const bond = await this.bondRepository.get(id);
      res.status(200).json(bond);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener el bono por permanencia', error });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const body = req.body;
      await this.bondRepository.update(body);
      res.status(200).json({ message: 'Bono por permanencia actualizado correctamente' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al actualizar el bono por permanencia', error });
    }
  }

  async remove(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.bondRepository.remove(id);
      res.status(200).json({ message: 'Bono por permanencia eliminado correctamente' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al eliminar el bono por permanencia', error });
    }
  }
}
