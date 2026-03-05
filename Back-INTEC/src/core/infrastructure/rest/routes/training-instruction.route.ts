import { Router, Request, Response, NextFunction } from "express";
import { TrainingInstructionController } from "../controllers/training-instruction.controller";
import { TrainingInstructionAdapter } from "../../adapters/training-instruction.adapter";
import { upload } from "../middlewares/upload.middleware";
import multer from "multer";

const trainingInstructionRouter = Router();
const adapter = new TrainingInstructionAdapter();
const controller = new TrainingInstructionController(adapter);

const uploadMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const uploader = upload.single('document');
    uploader(req, res, (err: any) => {
        if (err instanceof multer.MulterError) {
            return res.status(500).json({ message: "Error en subida de archivos (Multer)", error: err });
        } else if (err) {
            return res.status(500).json({ message: "Error desconocido al subir archivo", error: err });
        }
        next();
    });
};

trainingInstructionRouter.get('/instrucciones-capacitacion', (req, res) => controller.getDocuments(req, res));
trainingInstructionRouter.get('/instrucciones-capacitacion/tipo/:documentType', (req, res) => controller.getDocumentsByType(req, res));
trainingInstructionRouter.post('/instrucciones-capacitacion', uploadMiddleware, (req, res) => controller.uploadDocument(req, res));
trainingInstructionRouter.delete('/instrucciones-capacitacion/:id', (req, res) => controller.deleteDocument(req, res));

trainingInstructionRouter.post('/instrucciones-capacitacion-download', async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) {
            res.status(400).json({ message: "Falta la URL del archivo" });
            return;
        }

        const response = await fetch(url);
        if (!response.ok) {
            res.status(response.status).json({ message: "Error al descargar archivo desde Firebase" });
            return;
        }

        const buffer = await response.arrayBuffer();
        res.set('Content-Type', response.headers.get('content-type') || 'application/octet-stream');
        res.send(Buffer.from(buffer));
    } catch (error) {
        res.status(500).json({ message: "Error al descargar archivo", error });
    }
});

export default trainingInstructionRouter;
