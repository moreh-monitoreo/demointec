import { GoogleGenAI, Type, Content, Part, FunctionDeclaration } from '@google/genai';
import { aiToolCatalog, getToolByName } from './tools';
import { AI_REPORTS_SYSTEM_PROMPT } from './system-prompt';

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const MAX_TOOL_ITERATIONS = 4;

// El modelo no tiene nocion del reloj real; sin esto calcula mal periodos relativos
// ("este mes", "ultimos 6 meses") usando una fecha "de hoy" incorrecta.
function buildSystemInstruction(): string {
    const today = new Date().toISOString().slice(0, 10);
    return `${AI_REPORTS_SYSTEM_PROMPT}\n\nFecha actual del sistema (hoy): ${today}. Usa esta fecha como referencia de "hoy" para calcular cualquier periodo relativo (este mes, este año, los ultimos N meses, etc.) al construir los parametros de fecha de las herramientas.`;
}

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export interface ChartDataset {
    label: string;
    data: number[];
}

export interface ChartSpec {
    type: 'bar' | 'line' | 'pie' | 'doughnut';
    title: string;
    labels: string[];
    datasets: ChartDataset[];
}

export interface AiAnswer {
    reply: string;
    chart: ChartSpec | null;
    queriesUsed: string[];
}

let client: GoogleGenAI | null = null;
function getClient(): GoogleGenAI {
    if (!client) {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY no esta configurada en el servidor');
        }
        client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
    return client;
}

function mapParamType(t: string): Type {
    switch (t) {
        case 'string': return Type.STRING;
        case 'number': return Type.NUMBER;
        case 'integer': return Type.INTEGER;
        case 'boolean': return Type.BOOLEAN;
        default: return Type.STRING;
    }
}

function buildFunctionDeclarations(): FunctionDeclaration[] {
    return aiToolCatalog.map((tool) => ({
        name: tool.name,
        description: tool.description,
        parameters: {
            type: Type.OBJECT,
            properties: Object.fromEntries(
                Object.entries(tool.parameters.properties).map(([key, p]) => [
                    key,
                    {
                        type: mapParamType(p.type),
                        description: p.description,
                        ...(p.enum ? { enum: p.enum } : {}),
                    },
                ])
            ),
            required: tool.parameters.required || [],
        },
    }));
}

const CHART_RESPONSE_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        reply: { type: Type.STRING, description: 'Respuesta final en texto, en espanol, lista para mostrar al usuario.' },
        chart: {
            type: Type.OBJECT,
            nullable: true,
            description: 'Especificacion de un grafico solo si los datos se prestan para ello; de lo contrario null.',
            properties: {
                tipo: { type: Type.STRING, enum: ['bar', 'line', 'pie', 'doughnut'] },
                titulo: { type: Type.STRING },
                etiquetas: { type: Type.ARRAY, items: { type: Type.STRING } },
                series: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            nombre: { type: Type.STRING },
                            datos: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                        },
                        required: ['nombre', 'datos'],
                    },
                },
            },
            required: ['tipo', 'titulo', 'etiquetas', 'series'],
        },
    },
    required: ['reply'],
} as const;

function historyToContents(history: ChatMessage[]): Content[] {
    return history.map((h) => ({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: h.content }],
    }));
}

function normalizeChart(raw: any): ChartSpec | null {
    if (!raw || !Array.isArray(raw.etiquetas) || !Array.isArray(raw.series) || raw.series.length === 0) {
        return null;
    }
    return {
        type: raw.tipo || 'bar',
        title: raw.titulo || '',
        labels: raw.etiquetas,
        datasets: raw.series.map((s: any) => ({ label: s.nombre || '', data: (s.datos || []).map(Number) })),
    };
}

const CONTAINS_DIGIT = /\d/;

async function runToolLoop(ai: GoogleGenAI, contents: Content[], queriesUsed: string[]): Promise<string> {
    const tools = [{ functionDeclarations: buildFunctionDeclarations() }];
    let ungroundedRetryUsed = false;

    for (let iteration = 0; iteration < MAX_TOOL_ITERATIONS; iteration++) {
        const response = await ai.models.generateContent({
            model: MODEL,
            contents,
            config: {
                systemInstruction: buildSystemInstruction(),
                tools,
                temperature: 0.2,
            },
        });

        const parts: Part[] = response.candidates?.[0]?.content?.parts || [];
        const functionCalls = parts.filter((p) => p.functionCall).map((p) => p.functionCall!);

        if (functionCalls.length === 0) {
            const text = response.text || '';
            // Red de seguridad: si no se invoco ninguna herramienta en este turno pero la respuesta
            // trae numeros, es probable que el modelo este inventando o reutilizando una cifra de un
            // turno anterior en vez de consultar datos frescos. Se fuerza un reintento antes de aceptarla.
            if (!ungroundedRetryUsed && queriesUsed.length === 0 && CONTAINS_DIGIT.test(text)) {
                ungroundedRetryUsed = true;
                contents.push({ role: 'model', parts });
                contents.push({
                    role: 'user',
                    parts: [{
                        text: 'Tu respuesta anterior incluye cifras de la empresa pero no invocaste ninguna herramienta en este turno, lo cual viola tus reglas. Si la pregunta requiere datos reales, invoca ahora la herramienta correspondiente. Si en verdad no requiere datos (es una pregunta simple sobre ti o la conversacion), responde de nuevo sin mencionar ninguna cifra de la empresa.'
                    }],
                });
                continue;
            }
            return text;
        }

        contents.push({ role: 'model', parts });

        const responseParts: Part[] = [];
        for (const call of functionCalls) {
            const tool = call.name ? getToolByName(call.name) : undefined;
            const args = (call.args as Record<string, any>) || {};
            let result: any;
            if (!tool) {
                result = { error: `Herramienta desconocida: ${call.name}` };
            } else {
                try {
                    result = await tool.run(args);
                    queriesUsed.push(`${tool.name}(${JSON.stringify(args)})`);
                } catch (err: any) {
                    result = { error: `Error ejecutando la consulta: ${err.message}` };
                }
            }
            responseParts.push({ functionResponse: { name: call.name!, response: { result } } });
        }
        contents.push({ role: 'user', parts: responseParts });
    }

    // Se agoto el limite de iteraciones: forzar una respuesta final sin mas llamadas a herramientas.
    const forced = await ai.models.generateContent({
        model: MODEL,
        contents,
        config: { systemInstruction: buildSystemInstruction(), temperature: 0.2 },
    });
    return forced.text || 'No pude completar la consulta con la informacion disponible. Intenta reformular tu pregunta.';
}

async function requestStructuredAnswer(ai: GoogleGenAI, contents: Content[], groundedText: string): Promise<{ reply: string; chart: ChartSpec | null }> {
    const structuredContents: Content[] = [
        ...contents,
        { role: 'model', parts: [{ text: groundedText }] },
        {
            role: 'user',
            parts: [{
                text: 'Convierte tu ultima respuesta al formato JSON solicitado, manteniendo exactamente las mismas cifras que ya mencionaste. Si un grafico ayuda a visualizar los datos, inclúyelo; si no aplica (respuesta simple, sin datos numericos comparables), deja chart en null.'
            }],
        },
    ];

    const response = await ai.models.generateContent({
        model: MODEL,
        contents: structuredContents,
        config: {
            systemInstruction: buildSystemInstruction(),
            responseMimeType: 'application/json',
            responseSchema: CHART_RESPONSE_SCHEMA as any,
            temperature: 0.1,
        },
    });

    try {
        const parsed = JSON.parse(response.text || '{}');
        return {
            reply: parsed.reply || groundedText || 'No pude generar una respuesta.',
            chart: normalizeChart(parsed.chart),
        };
    } catch {
        return { reply: groundedText || 'No pude generar una respuesta.', chart: null };
    }
}

export async function askGemini(history: ChatMessage[], question: string): Promise<AiAnswer> {
    const ai = getClient();
    const contents = historyToContents(history);
    contents.push({ role: 'user', parts: [{ text: question }] });

    const queriesUsed: string[] = [];
    const groundedText = await runToolLoop(ai, contents, queriesUsed);
    const { reply, chart } = await requestStructuredAnswer(ai, contents, groundedText);
    return { reply, chart, queriesUsed };
}
