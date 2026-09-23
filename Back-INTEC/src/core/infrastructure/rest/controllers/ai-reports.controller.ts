import { Request, Response } from "express";
import { AiConversationRepository } from "../../../domain/repository/ai-conversation.repository";
import { AiMessageRepository } from "../../../domain/repository/ai-message.repository";
import { AiConversationEntity } from "../../entity/ai-conversation.entity";
import { AiMessageEntity } from "../../entity/ai-message.entity";
import { askGemini, ChatMessage } from "../../ai/gemini.service";

export class AiReportsController {
    constructor(
        private conversationRepository: AiConversationRepository<AiConversationEntity>,
        private messageRepository: AiMessageRepository<AiMessageEntity>,
    ) { }

    async listConversations(req: Request, res: Response): Promise<void> {
        try {
            const idUser = (req as any).user?.id;
            if (!idUser) { res.status(401).json({ message: 'No se pudo identificar al usuario' }); return; }
            const conversations = await this.conversationRepository.listByUser(idUser);
            res.status(200).json(conversations);
        } catch (error) {
            res.status(500).json({ message: 'Error al listar conversaciones', error });
        }
    }

    async getMessages(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const messages = await this.messageRepository.listByConversation(Number(id));
            res.status(200).json(messages);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener los mensajes', error });
        }
    }

    async removeConversation(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            await this.conversationRepository.remove(Number(id));
            res.status(200).json({ message: 'Conversacion eliminada correctamente' });
        } catch (error) {
            res.status(500).json({ message: 'Error al eliminar la conversacion', error });
        }
    }

    async sendMessage(req: Request, res: Response): Promise<void> {
        try {
            const idUser = (req as any).user?.id;
            const pregunta: string = (req.body.pregunta || '').trim();
            const idConversationInput = req.body.id_conversation;

            if (!idUser) { res.status(401).json({ message: 'No se pudo identificar al usuario' }); return; }
            if (!pregunta) { res.status(400).json({ message: 'La pregunta es requerida' }); return; }

            const conversation = idConversationInput
                ? await this.conversationRepository.get(idConversationInput)
                : await this.conversationRepository.create({ id_user: idUser, title: pregunta.slice(0, 80) });

            const previousMessages = await this.messageRepository.listByConversation(conversation.id);
            const chatHistory: ChatMessage[] = previousMessages.map((m) => ({
                role: m.role === 'assistant' ? 'assistant' : 'user',
                content: m.content,
            }));

            await this.messageRepository.create({ id_conversation: conversation.id, role: 'user', content: pregunta });

            const answer = await askGemini(chatHistory, pregunta);

            const assistantMessage = await this.messageRepository.create({
                id_conversation: conversation.id,
                role: 'assistant',
                content: answer.reply,
                chart_json: answer.chart ? JSON.stringify(answer.chart) : null,
                queries_used: answer.queriesUsed.length ? answer.queriesUsed.join(' | ') : null,
            });

            await this.conversationRepository.touch(conversation.id);

            res.status(200).json({
                id_conversation: conversation.id,
                title: conversation.title,
                message: {
                    id: assistantMessage.id,
                    role: 'assistant',
                    content: assistantMessage.content,
                    chart: answer.chart,
                    created_at: assistantMessage.created_at,
                },
            });
        } catch (error: any) {
            console.error('Error en AiReportsController.sendMessage:', error);
            res.status(500).json({ message: 'Error al procesar la pregunta. Intenta de nuevo en unos segundos.' });
        }
    }
}
