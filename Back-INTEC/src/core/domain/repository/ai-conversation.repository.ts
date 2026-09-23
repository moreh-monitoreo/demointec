export type Id = string | number;

export interface AiConversationRepository<T> {
    create(data: Partial<T>): Promise<T>;
    listByUser(id_user: number): Promise<T[]>;
    get(id: Id): Promise<T>;
    touch(id: Id): Promise<void>;
    remove(id: Id): Promise<T>;
}
