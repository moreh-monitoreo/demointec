import { Request, Response } from "express";
import { TrainingInstructionAdapter } from "../../adapters/training-instruction.adapter";
import { storage } from "../../../../firebase/firebase.config";
import { v4 as uuidv4 } from 'uuid';

export class TrainingInstructionController {
    constructor(private adapter: TrainingInstructionAdapter) { }

    private async uploadFile(file: Express.Multer.File, documentType: string): Promise<string> {
        const folder = documentType;
        const token = uuidv4();
        const fileName = `training-instructions/${folder}/${token}_${file.originalname}`;
        const fileUpload = storage.file(fileName);

        const blobStream = fileUpload.createWriteStream({
            metadata: {
                contentType: file.mimetype,
                metadata: {
                    firebaseStorageDownloadTokens: token
                }
            }
        });

        return new Promise((resolve, reject) => {
            blobStream.on('error', (error) => {
                reject(error);
            });
            blobStream.on('finish', () => {
                const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${storage.name}/o/${encodeURIComponent(fileUpload.name)}?alt=media&token=${token}`;
                resolve(publicUrl);
            });
            blobStream.end(file.buffer);
        });
    }

    async getDocuments(req: Request, res: Response): Promise<void> {
        try {
            const documents = await this.adapter.getAllDocuments();
            res.status(200).json(documents);
        } catch (error) {
            res.status(500).json({ message: "Error al obtener instrucciones de capacitacion", error });
        }
    }

    async getDocumentsByType(req: Request, res: Response): Promise<void> {
        try {
            const { documentType } = req.params;
            const documents = await this.adapter.getDocumentsByType(documentType);
            res.status(200).json(documents);
        } catch (error) {
            res.status(500).json({ message: "Error al obtener instrucciones por tipo", error });
        }
    }

    async uploadDocument(req: Request, res: Response): Promise<void> {
        try {
            const body = req.body;

            if (!body.document_type) {
                res.status(400).json({ message: "Faltan datos requeridos (document_type)" });
                return;
            }

            if (req.file) {
                try {
                    const fileUrl = await this.uploadFile(req.file, body.document_type);
                    body.document_path = fileUrl;
                    body.name_document = req.file.originalname;
                } catch (uploadError) {
                    res.status(500).json({ message: "Error al subir archivo", error: uploadError });
                    return;
                }
            } else {
                res.status(400).json({ message: "No se envio ningun archivo" });
                return;
            }

            const doc = await this.adapter.saveDocument(body);
            res.status(201).json({ message: "Instruccion de capacitacion guardada correctamente", doc });
        } catch (error) {
            res.status(500).json({ message: "Error al guardar instruccion de capacitacion", error });
        }
    }

    async deleteDocument(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            if (!id) {
                res.status(400).json({ message: "Falta el ID del documento" });
                return;
            }
            await this.adapter.deleteDocument(Number(id));
            res.status(200).json({ message: "Instruccion de capacitacion eliminada correctamente" });
        } catch (error) {
            res.status(500).json({ message: "Error al eliminar instruccion de capacitacion", error });
        }
    }

    async createLocalFolders(req: Request, res: Response): Promise<void> {
        try {
            const { folders } = req.body;

            if (!folders || !Array.isArray(folders) || folders.length === 0) {
                res.status(400).json({ message: "Se requiere un arreglo de nombres de carpetas (folders)" });
                return;
            }

            const created = this.adapter.createLocalFolders(folders);
            res.status(200).json({
                message: "Carpetas creadas correctamente en el almacenamiento local",
                created
            });
        } catch (error) {
            res.status(500).json({ message: "Error al crear carpetas en almacenamiento local", error });
        }
    }
}
