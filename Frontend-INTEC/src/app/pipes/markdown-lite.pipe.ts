import { Pipe, PipeTransform } from '@angular/core';

// Convierte un subconjunto minimo de markdown (negritas y listas con * o -) a HTML seguro.
// No usa una libreria de markdown completa a proposito: el contenido viene de la IA y aqui
// controlamos exactamente que etiquetas se generan (Angular ademas sanea el innerHTML resultante).
function renderMarkdownLite(text: string): string {
    const escaped = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    const lines = escaped.split('\n');
    const htmlParts: string[] = [];
    let listBuffer: string[] = [];

    const flushList = () => {
        if (listBuffer.length) {
            htmlParts.push('<ul>' + listBuffer.map((li) => `<li>${li}</li>`).join('') + '</ul>');
            listBuffer = [];
        }
    };

    for (const rawLine of lines) {
        const line = rawLine.trim();
        const bulletMatch = line.match(/^[*-]\s+(.*)$/);
        if (bulletMatch) {
            listBuffer.push(bulletMatch[1]);
        } else if (line === '') {
            flushList();
        } else {
            flushList();
            htmlParts.push(`<p>${line}</p>`);
        }
    }
    flushList();

    return htmlParts.join('');
}

@Pipe({
    name: 'markdownLite',
    standalone: true,
})
export class MarkdownLitePipe implements PipeTransform {
    transform(text: string | null | undefined): string {
        if (!text) return '';
        return renderMarkdownLite(text);
    }
}
