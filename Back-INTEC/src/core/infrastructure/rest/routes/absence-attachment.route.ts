import { Router } from "express";
import { AbsenceAttachmentAdapter } from "../../adapters/absence-attachment.adapter";
import { AbsenceAttachmentController } from "../controllers/absence-attachment.controller";
import { upload } from "../middlewares/upload.middleware";

const absenceAttachmentRouter = Router();
const adapter = new AbsenceAttachmentAdapter();
const controller = new AbsenceAttachmentController(adapter);

// upload.array sin tope fijo: acepta múltiples archivos en el campo 'files'
absenceAttachmentRouter.post('/adjuntos', upload.array('files'), (req, res) => controller.upload(req, res));
absenceAttachmentRouter.get('/adjuntos/:referenceId', (req, res) => controller.listByReference(req, res));
absenceAttachmentRouter.delete('/adjuntos/:id', (req, res) => controller.delete(req, res));

export default absenceAttachmentRouter;
