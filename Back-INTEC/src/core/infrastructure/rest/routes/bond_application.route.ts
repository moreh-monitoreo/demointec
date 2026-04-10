import { Router } from 'express';
import { BondApplicationController } from '../controllers/bond_application.controller';
import { BondApplicationAdapterRepository } from '../../adapters/bond_application.adapter';

const bondApplicationRouter = Router();
const controller = new BondApplicationController(new BondApplicationAdapterRepository());

bondApplicationRouter.post('/bonoPermanencia', controller.create.bind(controller));
bondApplicationRouter.get('/bonoPermanencia', controller.list.bind(controller));
bondApplicationRouter.get('/bonoPermanencia/:id', controller.get.bind(controller));
bondApplicationRouter.put('/bonoPermanencia/:id', controller.update.bind(controller));
bondApplicationRouter.delete('/bonoPermanencia/:id', controller.remove.bind(controller));

export default bondApplicationRouter;
