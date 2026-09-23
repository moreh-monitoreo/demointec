export interface AiChartDataset {
    label: string;
    data: number[];
}

export interface AiChartSpec {
    type: 'bar' | 'line' | 'pie' | 'doughnut';
    title: string;
    labels: string[];
    datasets: AiChartDataset[];
}

export interface AiConversation {
    id: number;
    id_user: number;
    title: string;
    created_at: string;
    updated_at: string;
}

export interface AiMessage {
    id: number;
    id_conversation: number;
    role: 'user' | 'assistant';
    content: string;
    chart_json: string | null;
    queries_used: string | null;
    created_at: string;
}

export interface AiChatResponse {
    id_conversation: number;
    title: string;
    message: {
        id: number;
        role: 'assistant';
        content: string;
        chart: AiChartSpec | null;
        created_at: string;
    };
}
