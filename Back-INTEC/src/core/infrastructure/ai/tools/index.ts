import { AiTool } from './types';
import { hrTools } from './hr-queries';
import { payrollTools } from './payroll-queries';
import { inventoryTools } from './inventory-queries';
import { financeTools } from './finance-queries';

// Catalogo completo de herramientas (consultas seguras y predefinidas) que Gemini puede invocar.
// Para agregar una nueva pregunta soportada: agregar una entrada aqui, nunca dejar que el modelo escriba SQL libre.
export const aiToolCatalog: AiTool[] = [
    ...hrTools,
    ...payrollTools,
    ...inventoryTools,
    ...financeTools,
];

export function getToolByName(name: string): AiTool | undefined {
    return aiToolCatalog.find((t) => t.name === name);
}
