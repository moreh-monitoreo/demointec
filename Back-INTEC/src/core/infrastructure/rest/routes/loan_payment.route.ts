import { Router } from 'express';
import { LoanPaymentController } from '../controllers/loan_payment.controller';
import { LoanPaymentAdapterRepository } from '../../adapters/loan_payment.adapter';

const loanPaymentRouter = Router();
const controller = new LoanPaymentController(new LoanPaymentAdapterRepository());

loanPaymentRouter.post('/pagosPrestamo', controller.create.bind(controller));
loanPaymentRouter.get('/pagosPrestamo', controller.list.bind(controller));
loanPaymentRouter.get('/pagosPrestamo/prestamo/:id_loan', controller.getByLoan.bind(controller));
loanPaymentRouter.get('/pagosPrestamo/:id', controller.get.bind(controller));
loanPaymentRouter.put('/pagosPrestamo/:id', controller.update.bind(controller));
loanPaymentRouter.delete('/pagosPrestamo/:id', controller.remove.bind(controller));

export default loanPaymentRouter;
