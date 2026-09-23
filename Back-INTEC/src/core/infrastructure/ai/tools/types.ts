// Contrato de una herramienta (funcion) que Gemini puede invocar.
// Cada herramienta ejecuta SQL parametrizado de solo lectura contra reportsPool
// y devuelve filas reales; Gemini nunca genera SQL por si mismo.
export interface AiToolParam {
    type: 'string' | 'number' | 'integer' | 'boolean';
    description: string;
    enum?: string[];
}

export interface AiTool {
    name: string;
    description: string;
    parameters: {
        type: 'object';
        properties: Record<string, AiToolParam>;
        required?: string[];
    };
    run: (args: Record<string, any>) => Promise<any[]>;
}

// YYYY-MM-DD si viene del modelo; si no, se usan los ultimos 12 meses.
export function resolveDateRange(start?: string, end?: string): { start: string; end: string } {
    const today = new Date();
    const defaultEnd = today.toISOString().slice(0, 10);
    const defaultStartDate = new Date(today);
    defaultStartDate.setMonth(defaultStartDate.getMonth() - 12);
    const defaultStart = defaultStartDate.toISOString().slice(0, 10);
    return {
        start: start && /^\d{4}-\d{2}-\d{2}$/.test(start) ? start : defaultStart,
        end: end && /^\d{4}-\d{2}-\d{2}$/.test(end) ? end : defaultEnd,
    };
}
