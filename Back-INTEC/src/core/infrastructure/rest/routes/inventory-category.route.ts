import { Router } from 'express';
import { InventoryCategoryController } from '../controllers/inventory-category.controller';
import { InventoryCategoryAdapterRepository } from '../../adapters/inventory-category.adapter';

const inventoryCategoryRouter = Router();
const controller = new InventoryCategoryController(new InventoryCategoryAdapterRepository());

inventoryCategoryRouter.post('/categories-inventory', controller.create.bind(controller));
inventoryCategoryRouter.get('/categories-inventory', controller.list.bind(controller));
inventoryCategoryRouter.get('/categories-inventory/:id', controller.get.bind(controller));
inventoryCategoryRouter.put('/categories-inventory/:id', controller.update.bind(controller));
inventoryCategoryRouter.delete('/categories-inventory/:id', controller.remove.bind(controller));

export default inventoryCategoryRouter;
