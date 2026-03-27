import { config } from 'dotenv';
import { Request, Response } from "express";
import { LoanRequestRepository } from '../../../domain/repository/loan_request.repository';
import { LoanRequestEntity } from '../../entity/loan_request.entity';

config();

export class LoanRequestController {
  constructor(private loanRepository: LoanRequestRepository<LoanRequestEntity>) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const body = req.body;
      await this.loanRepository.create(body);
      res.status(200).json({ message: 'Préstamo registrado correctamente' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al registrar el préstamo', error });
    }
  }

  async list(req: Request, res: Response): Promise<void> {
    try {
      const loans = await this.loanRepository.list();
      res.status(200).json(loans);
    } catch (error) {
      res.status(500).json({ message: 'Error al listar los préstamos', error });
    }
  }

  async get(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const loan = await this.loanRepository.get(id);
      res.status(200).json(loan);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener el préstamo', error });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const body = req.body;
      await this.loanRepository.update(body);
      res.status(200).json({ message: 'Préstamo actualizado correctamente' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al actualizar el préstamo', error });
    }
  }

  async remove(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.loanRepository.remove(id);
      res.status(200).json({ message: 'Préstamo eliminado correctamente' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al eliminar el préstamo', error });
    }
  }
}
