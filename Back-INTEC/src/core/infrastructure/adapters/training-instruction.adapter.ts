import * as fs from "fs";
import * as path from "path";
import { AppDataSource } from "../../../config/db";
import { TrainingInstructionEntity } from "../entity/training-instruction.entity";
import { storage } from "../../../firebase/firebase.config";

export class TrainingInstructionAdapter {
    async getAllDocuments(): Promise<TrainingInstructionEntity[]> {
        const repository = AppDataSource.getRepository(TrainingInstructionEntity);
        return await repository.find();
    }

    async getDocumentsByType(documentType: string): Promise<TrainingInstructionEntity[]> {
        const repository = AppDataSource.getRepository(TrainingInstructionEntity);
        return await repository.find({
            where: { document_type: documentType }
        });
    }

    async saveDocument(data: Partial<TrainingInstructionEntity>): Promise<TrainingInstructionEntity> {
        const repository = AppDataSource.getRepository(TrainingInstructionEntity);
        const doc = repository.create(data);
        return await repository.save(doc);
    }

    async deleteDocument(id: number): Promise<void> {
        const repository = AppDataSource.getRepository(TrainingInstructionEntity);
        const document = await repository.findOne({ where: { id } });
        if (document && document.document_path) {
            const decodedUrl = decodeURIComponent(document.document_path);
            const filePath = decodedUrl.split('/o/')[1]?.split('?')[0];
            if (filePath) {
                try {
                    await storage.file(decodeURIComponent(filePath)).delete();
                } catch (e) {
                    // ignore if file not found in storage
                }
            }
        }
        await repository.delete(id);
    }

    createLocalFolders(folders: string[]): string[] {
        const baseDir = path.resolve("uploads", "training-instructions");
        const created: string[] = [];

        for (const folderName of folders) {
            const targetPath = path.join(baseDir, folderName);
            if (!fs.existsSync(targetPath)) {
                fs.mkdirSync(targetPath, { recursive: true });
                created.push(targetPath);
            }
        }

        return created;
    }
}
