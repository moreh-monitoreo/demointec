import { AiMessageRepository } from "../../domain/repository/ai-message.repository";
import { AiMessageEntity } from "../entity/ai-message.entity";
import database from "../../../config/db";

export class AiMessageAdapterRepository implements AiMessageRepository<AiMessageEntity> {

    async create(data: Partial<AiMessageEntity>): Promise<AiMessageEntity> {
        const repository = database.getRepository(AiMessageEntity);
        const message = repository.create(data);
        await repository.save(message);
        return message;
    }

    async listByConversation(id_conversation: number): Promise<AiMessageEntity[]> {
        const repository = database.getRepository(AiMessageEntity);
        return repository.find({
            where: { id_conversation },
            order: { created_at: 'ASC' }
        });
    }
}
