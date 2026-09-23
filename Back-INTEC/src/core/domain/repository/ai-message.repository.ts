export type Id = string | number;

export interface AiMessageRepository<T> {
    create(data: Partial<T>): Promise<T>;
    listByConversation(id_conversation: number): Promise<T[]>;
}
