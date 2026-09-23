import { Router } from "express";
import { verifyToken } from "../../../middleware/auth.middleware";
import { AiConversationAdapterRepository } from "../../adapters/ai-conversation.adapter";
import { AiMessageAdapterRepository } from "../../adapters/ai-message.adapter";
import { AiReportsController } from "../controllers/ai-reports.controller";

const aiReportsRouter = Router();
const conversationRepository = new AiConversationAdapterRepository();
const messageRepository = new AiMessageAdapterRepository();
const aiReportsController = new AiReportsController(conversationRepository, messageRepository);

aiReportsRouter.get('/reportes-ia/conversaciones', verifyToken, (req, res) => aiReportsController.listConversations(req, res));
aiReportsRouter.get('/reportes-ia/conversaciones/:id/mensajes', verifyToken, (req, res) => aiReportsController.getMessages(req, res));
aiReportsRouter.post('/reportes-ia/mensajes', verifyToken, (req, res) => aiReportsController.sendMessage(req, res));
aiReportsRouter.delete('/reportes-ia/conversaciones/:id', verifyToken, (req, res) => aiReportsController.removeConversation(req, res));

export default aiReportsRouter;
