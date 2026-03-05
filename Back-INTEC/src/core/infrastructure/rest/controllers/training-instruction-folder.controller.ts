import { Request, Response } from "express";
import { TrainingInstructionFolderAdapter } from "../../adapters/training-instruction-folder.adapter";

export class TrainingInstructionFolderController {
    constructor(private adapter: TrainingInstructionFolderAdapter) { }

    async getFolders(req: Request, res: Response): Promise<void> {
        try {
            const folders = await this.adapter.getAllFolders();
            res.status(200).json(folders);
        } catch (error) {
            res.status(500).json({ message: "Error al obtener carpetas de capacitación", error });
        }
    }

    async createFolder(req: Request, res: Response): Promise<void> {
        try {
            const { folder_name } = req.body;
            if (!folder_name || !folder_name.trim()) {
                res.status(400).json({ message: "Se requiere el nombre de la carpeta (folder_name)" });
                return;
            }
            const folder = await this.adapter.createFolder(folder_name.trim());
            res.status(201).json({ message: "Carpeta creada correctamente", folder });
        } catch (error) {
            res.status(500).json({ message: "Error al crear carpeta de capacitación", error });
        }
    }

    async deleteFolder(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            if (!id) {
                res.status(400).json({ message: "Falta el ID de la carpeta" });
                return;
            }
            await this.adapter.deleteFolder(Number(id));
            res.status(200).json({ message: "Carpeta eliminada correctamente" });
        } catch (error) {
            res.status(500).json({ message: "Error al eliminar carpeta de capacitación", error });
        }
    }
}
