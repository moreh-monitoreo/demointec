import { Router } from 'express';
import { LoanRequestController } from '../controllers/loan_request.controller';
import { LoanRequestAdapterRepository } from '../../adapters/loan_request.adapter';

const loanRequestRouter = Router();
const controller = new LoanRequestController(new LoanRequestAdapterRepository());

loanRequestRouter.post('/prestamos', controller.create.bind(controller));
loanRequestRouter.get('/prestamos', controller.list.bind(controller));
loanRequestRouter.get('/prestamos/:id', controller.get.bind(controller));
loanRequestRouter.put('/prestamos/:id', controller.update.bind(controller));
loanRequestRouter.delete('/prestamos/:id', controller.remove.bind(controller));

export default loanRequestRouter;
