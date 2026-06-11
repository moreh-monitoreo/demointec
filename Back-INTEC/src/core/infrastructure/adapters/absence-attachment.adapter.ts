import database from "../../../config/db";
import { AbsenceAttachmentEntity } from "../entity/absence-attachment.entity";

export class AbsenceAttachmentAdapter {
    async create(data: Partial<AbsenceAttachmentEntity>): Promise<AbsenceAttachmentEntity> {
        const repository = database.getRepository(AbsenceAttachmentEntity);
        const attachment = repository.create(data);
        return repository.save(attachment);
    }

    async listByReference(referenceId: string): Promise<AbsenceAttachmentEntity[]> {
        const repository = database.getRepository(AbsenceAttachmentEntity);
        return repository.find({
            where: { reference_id: referenceId },
            order: { created_at: 'ASC' }
        });
    }

    async delete(id: number): Promise<void> {
        const repository = database.getRepository(AbsenceAttachmentEntity);
        await repository.delete(id);
    }
}
