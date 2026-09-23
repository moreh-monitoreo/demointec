export class AiMessage {
    private id: number | undefined;
    private id_conversation: number | undefined;
    private role: string | undefined;
    private content: string | undefined;
    private chart_json: string | undefined;
    private queries_used: string | undefined;
    private created_at: Date | undefined;

    public get getId(): number | undefined {
        return this.id;
    }
    public set setId(id: number | undefined) {
        this.id = id;
    }

    public get getIdConversation(): number | undefined {
        return this.id_conversation;
    }
    public set setIdConversation(id_conversation: number | undefined) {
        this.id_conversation = id_conversation;
    }

    public get getRole(): string | undefined {
        return this.role;
    }
    public set setRole(role: string | undefined) {
        this.role = role;
    }

    public get getContent(): string | undefined {
        return this.content;
    }
    public set setContent(content: string | undefined) {
        this.content = content;
    }

    public get getChartJson(): string | undefined {
        return this.chart_json;
    }
    public set setChartJson(chart_json: string | undefined) {
        this.chart_json = chart_json;
    }

    public get getQueriesUsed(): string | undefined {
        return this.queries_used;
    }
    public set setQueriesUsed(queries_used: string | undefined) {
        this.queries_used = queries_used;
    }

    public get getCreatedAt(): Date | undefined {
        return this.created_at;
    }
    public set setCreatedAt(created_at: Date | undefined) {
        this.created_at = created_at;
    }
}
