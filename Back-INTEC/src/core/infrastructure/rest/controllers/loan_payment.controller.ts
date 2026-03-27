import { config } from 'dotenv';
import { Request, Response } from "express";
import { LoanPaymentRepository } from '../../../domain/repository/loan_payment.repository';
import { LoanPaymentEntity } from '../../entity/loan_payment.entity';

config();

export class LoanPaymentController {
  constructor(private paymentRepository: LoanPaymentRepository<LoanPaymentEntity>) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const body = req.body;
      await this.paymentRepository.create(body);
      res.status(200).json({ message: 'Pago registrado correctamente' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al registrar el pago', error });
    }
  }

  async list(req: Request, res: Response): Promise<void> {
    try {
      const payments = await this.paymentRepository.list();
      res.status(200).json(payments);
    } catch (error) {
      res.status(500).json({ message: 'Error al listar los pagos', error });
    }
  }

  async get(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const payment = await this.paymentRepository.get(id);
      res.status(200).json(payment);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener el pago', error });
    }
  }

  async getByLoan(req: Request, res: Response): Promise<void> {
    try {
      const { id_loan } = req.params;
      const payments = await this.paymentRepository.getByLoan(id_loan);
      res.status(200).json(payments);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener los pagos del préstamo', error });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const body = req.body;
      await this.paymentRepository.update(body);
      res.status(200).json({ message: 'Pago actualizado correctamente' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al actualizar el pago', error });
    }
  }

  async remove(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.paymentRepository.remove(id);
      res.status(200).json({ message: 'Pago eliminado correctamente' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al eliminar el pago', error });
    }
  }
}
