import { AiConversationRepository, Id } from "../../domain/repository/ai-conversation.repository";
import { AiConversationEntity } from "../entity/ai-conversation.entity";
import database from "../../../config/db";
import { NotFound } from "http-errors";

export class AiConversationAdapterRepository implements AiConversationRepository<AiConversationEntity> {

    async create(data: Partial<AiConversationEntity>): Promise<AiConversationEntity> {
        const repository = database.getRepository(AiConversationEntity);
        const conversation = repository.create(data);
        await repository.save(conversation);
        return conversation;
    }

    async listByUser(id_user: number): Promise<AiConversationEntity[]> {
        const repository = database.getRepository(AiConversationEntity);
        return repository.find({
            where: { id_user },
            order: { updated_at: 'DESC' }
        });
    }

    async get(id: Id): Promise<AiConversationEntity> {
        const repository = database.getRepository(AiConversationEntity);
        const data = await repository.findOne({ where: { id: id as number } });
        if (!data) {
            throw new NotFound("No existe la conversacion con el id proporcionado");
        }
        return data;
    }

    async touch(id: Id): Promise<void> {
        const repository = database.getRepository(AiConversationEntity);
        await repository.update(id, { updated_at: new Date() });
    }

    async remove(id: Id): Promise<AiConversationEntity> {
        const repository = database.getRepository(AiConversationEntity);
        const conversation = await this.get(id);
        await repository.delete(id);
        return conversation;
    }
}
