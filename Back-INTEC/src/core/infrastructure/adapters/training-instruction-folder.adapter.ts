import { AppDataSource } from "../../../config/db";
import { TrainingInstructionFolderEntity } from "../entity/training-instruction-folder.entity";
import { storage } from "../../../firebase/firebase.config";

export class TrainingInstructionFolderAdapter {
    async getAllFolders(): Promise<TrainingInstructionFolderEntity[]> {
        const repository = AppDataSource.getRepository(TrainingInstructionFolderEntity);
        return await repository.find({ order: { created_at: 'ASC' } });
    }

    async createFolder(folderName: string): Promise<TrainingInstructionFolderEntity> {
        const repository = AppDataSource.getRepository(TrainingInstructionFolderEntity);

        const placeholderPath = `training-instructions/${folderName}/.keep`;
        const file = storage.file(placeholderPath);

        await file.save('', { contentType: 'text/plain' });

        const folderPath = `https://firebasestorage.googleapis.com/v0/b/${storage.name}/o/${encodeURIComponent(placeholderPath)}`;

        const folder = repository.create({ folder_name: folderName, folder_path: folderPath });
        return await repository.save(folder);
    }

    async deleteFolder(id: number): Promise<void> {
        const repository = AppDataSource.getRepository(TrainingInstructionFolderEntity);
        await repository.delete(id);
    }
}
