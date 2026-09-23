export class AiConversation {
    private id: number | undefined;
    private id_user: number | undefined;
    private title: string | undefined;
    private created_at: Date | undefined;
    private updated_at: Date | undefined;

    public get getId(): number | undefined {
        return this.id;
    }
    public set setId(id: number | undefined) {
        this.id = id;
    }

    public get getIdUser(): number | undefined {
        return this.id_user;
    }
    public set setIdUser(id_user: number | undefined) {
        this.id_user = id_user;
    }

    public get getTitle(): string | undefined {
        return this.title;
    }
    public set setTitle(title: string | undefined) {
        this.title = title;
    }

    public get getCreatedAt(): Date | undefined {
        return this.created_at;
    }
    public set setCreatedAt(created_at: Date | undefined) {
        this.created_at = created_at;
    }

    public get getUpdatedAt(): Date | undefined {
        return this.updated_at;
    }
    public set setUpdatedAt(updated_at: Date | undefined) {
        this.updated_at = updated_at;
    }
}
