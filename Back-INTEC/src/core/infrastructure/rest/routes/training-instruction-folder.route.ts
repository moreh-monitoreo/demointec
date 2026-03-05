import { Router } from "express";
import { TrainingInstructionFolderController } from "../controllers/training-instruction-folder.controller";
import { TrainingInstructionFolderAdapter } from "../../adapters/training-instruction-folder.adapter";

const trainingInstructionFolderRouter = Router();
const adapter = new TrainingInstructionFolderAdapter();
const controller = new TrainingInstructionFolderController(adapter);

trainingInstructionFolderRouter.get('/instrucciones-capacitacion-carpetas', (req, res) => controller.getFolders(req, res));
trainingInstructionFolderRouter.post('/instrucciones-capacitacion-carpetas', (req, res) => controller.createFolder(req, res));
trainingInstructionFolderRouter.delete('/instrucciones-capacitacion-carpetas/:id', (req, res) => controller.deleteFolder(req, res));

export default trainingInstructionFolderRouter;
