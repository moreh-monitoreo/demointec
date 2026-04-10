import { Router } from 'express';
import { BondRecommendationController } from '../controllers/bond_recommendation.controller';
import { BondRecommendationAdapterRepository } from '../../adapters/bond_recommendation.adapter';

const bondRecommendationRouter = Router();
const controller = new BondRecommendationController(new BondRecommendationAdapterRepository());

bondRecommendationRouter.post('/bonoRecomendacion', controller.create.bind(controller));
bondRecommendationRouter.get('/bonoRecomendacion', controller.list.bind(controller));
bondRecommendationRouter.get('/bonoRecomendacion/:id', controller.get.bind(controller));
bondRecommendationRouter.put('/bonoRecomendacion/:id', controller.update.bind(controller));
bondRecommendationRouter.delete('/bonoRecomendacion/:id', controller.remove.bind(controller));

export default bondRecommendationRouter;
