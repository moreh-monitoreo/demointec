import { Router, Request, Response, NextFunction } from "express";
import { UploadController } from "../controllers/upload.controller";
import { upload } from "../middlewares/upload.middleware";
import multer from "multer";

const uploadRouter = Router();
const controller = new UploadController();

// Debug Middleware for Upload
const uploadMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const uploader = upload.single('file'); // Expect field name 'file'
    uploader(req, res, (err: any) => {
        if (err instanceof multer.MulterError) {
            return res.status(500).json({ message: "Error en subida de archivos (Multer)", error: err });
        } else if (err) {
            return res.status(500).json({ message: "Error desconocido al subir archivo", error: err });
        }
        next();
    });
};

uploadRouter.post('/uploads', uploadMiddleware, (req, res) => { controller.uploadFile(req, res); });

const uploadMultipleMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const uploader = upload.array('files', 10); // Máximo 10 archivos
    uploader(req, res, (err: any) => {
        if (err instanceof multer.MulterError) {
            return res.status(500).json({ message: "Error en subida de archivos (Multer)", error: err });
        } else if (err) {
            return res.status(500).json({ message: "Error desconocido al subir archivos", error: err });
        }
        next();
    });
};

uploadRouter.post('/uploads/multiple', uploadMultipleMiddleware, (req, res) => { controller.uploadMultiple(req, res); });

export default uploadRouter;
