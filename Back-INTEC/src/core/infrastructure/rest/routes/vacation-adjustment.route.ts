import { Router } from "express";
import { VacationAdjustmentAdapter } from "../../adapters/vacation-adjustment.adapter";
import { VacationAdjustmentController } from "../controllers/vacation-adjustment.controller";

const vacationAdjustmentRouter = Router();
const adapter = new VacationAdjustmentAdapter();
const controller = new VacationAdjustmentController(adapter);

vacationAdjustmentRouter.get('/ajustes-vacaciones', (req, res) => controller.list(req, res));
vacationAdjustmentRouter.post('/ajustes-vacaciones', (req, res) => controller.upsert(req, res));

export default vacationAdjustmentRouter;
