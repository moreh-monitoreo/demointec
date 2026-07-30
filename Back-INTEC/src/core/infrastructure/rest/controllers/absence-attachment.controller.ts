import { Request, Response } from "express";
import { AbsenceAttachmentAdapter } from "../../adapters/absence-attachment.adapter";
import { storage } from "../../../../firebase/firebase.config";
import { v4 as uuidv4 } from 'uuid';

export class AbsenceAttachmentController {
    constructor(private adapter: AbsenceAttachmentAdapter) { }

    // Sube un archivo a Firebase en: documentos/{id_employee}/{tipo}/{uuid}_{nombre}
    private async uploadFile(file: Express.Multer.File, idEmployee: string, refType: string): Promise<string> {
        const token = uuidv4();
        const folder = `documentos/${idEmployee}/${refType}`;
        const fileName = `${folder}/${token}_${file.originalname}`;
        const fileUpload = storage.file(fileName);

        const blobStream = fileUpload.createWriteStream({
            metadata: {
                contentType: file.mimetype,
                metadata: { firebaseStorageDownloadTokens: token }
            }
        });

        return new Promise((resolve, reject) => {
            blobStream.on('error', (error) => reject(error));
            blobStream.on('finish', () => {
                const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${storage.name}/o/${encodeURIComponent(fileUpload.name)}?alt=media&token=${token}`;
                resolve(publicUrl);
            });
            blobStream.end(file.buffer);
        });
    }

    // Sube uno o varios archivos y crea un registro por cada uno
    async upload(req: Request, res: Response): Promise<void> {
        try {
            const { id_employee, reference_type, reference_id } = req.body;
            const files = req.files as Express.Multer.File[] | undefined;

            if (!id_employee || !reference_type || !reference_id) {
                res.status(400).json({ message: "Faltan datos requeridos (id_employee, reference_type, reference_id)" });
                return;
            }
            if (!files || files.length === 0) {
                res.status(400).json({ message: "No se envió ningún archivo" });
                return;
            }

            const saved = [];
            for (const file of files) {
                const url = await this.uploadFile(file, id_employee, reference_type);
                const record = await this.adapter.create({
                    id_employee,
                    reference_type,
                    reference_id,
                    file_url: url,
                    file_name: file.originalname
                });
                saved.push(record);
            }

            res.status(201).json({ message: "Archivos guardados correctamente", attachments: saved });
        } catch (error: any) {
            console.error('[ATTACHMENT UPLOAD ERROR]', error?.message || error);
            res.status(500).json({ message: "Error al subir archivos", error: error?.message });
        }
    }

    async listByReference(req: Request, res: Response): Promise<void> {
        try {
            const { referenceId } = req.params;
            const attachments = await this.adapter.listByReference(referenceId);
            res.status(200).json(attachments);
        } catch (error: any) {
            console.error('[ATTACHMENT LIST ERROR]', error?.message || error);
            res.status(500).json({ message: "Error al listar archivos", error: error?.message });
        }
    }

    async delete(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            await this.adapter.delete(Number(id));
            res.status(200).json({ message: "Archivo eliminado correctamente" });
        } catch (error: any) {
            console.error('[ATTACHMENT DELETE ERROR]', error?.message || error);
            res.status(500).json({ message: "Error al eliminar archivo", error: error?.message });
        }
    }
}
