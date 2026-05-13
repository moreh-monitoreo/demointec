import { Request, Response } from "express";
import { storage } from "../../../../firebase/firebase.config";
import { v4 as uuidv4 } from 'uuid';

export class UploadController {
    async uploadMultiple(req: Request, res: Response) {
        try {
            if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
                return res.status(400).json({ message: "No se proporcionaron archivos" });
            }

            const files = req.files as Express.Multer.File[];
            const uploadPromises = files.map(file => {
                return new Promise<string>((resolve, reject) => {
                    const fileName = `job-descriptions/${uuidv4()}_${file.originalname}`;
                    const fileUpload = storage.file(fileName);

                    const blobStream = fileUpload.createWriteStream({
                        metadata: { contentType: file.mimetype }
                    });

                    blobStream.on('error', reject);

                    blobStream.on('finish', async () => {
                        try {
                            try { await fileUpload.makePublic(); } catch (e) { /* ignore */ }
                            resolve(`https://storage.googleapis.com/${storage.name}/${fileUpload.name}`);
                        } catch (err) {
                            reject(err);
                        }
                    });

                    blobStream.end(file.buffer);
                });
            });

            const paths = await Promise.all(uploadPromises);
            res.json({ message: "Archivos subidos correctamente", paths });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error inesperado al subir archivos" });
        }
    }

    async uploadFile(req: Request, res: Response) {
        try {
            if (!req.file) {
                return res.status(400).json({ message: "No se proporcionó ningún archivo" });
            }

            console.log('Starting generic file upload to Firebase:', req.file.originalname);

            const fileName = `job-descriptions/${uuidv4()}_${req.file.originalname}`;
            const fileUpload = storage.file(fileName);

            const blobStream = fileUpload.createWriteStream({
                metadata: {
                    contentType: req.file.mimetype
                }
            });

            blobStream.on('error', (error) => {
                console.error('Firebase Storage Error:', error);
                res.status(500).json({ message: "Error al subir archivo a Firebase", error });
            });

            blobStream.on('finish', async () => {
                try {
                    // Try to make it public
                    try {
                        await fileUpload.makePublic();
                    } catch (e) {
                        console.warn('Could not make file public automatically:', e);
                    }

                    const publicUrl = `https://storage.googleapis.com/${storage.name}/${fileUpload.name}`;

                    res.json({
                        message: "Archivo subido correctamente",
                        path: publicUrl,
                        filename: fileName,
                        originalName: req.file!.originalname
                    });
                } catch (error) {
                    console.error('Error post-upload:', error);
                    res.status(500).json({ message: "Error al finalizar subida", error });
                }
            });

            blobStream.end(req.file.buffer);

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error inesperado al subir archivo" });
        }
    }
}
