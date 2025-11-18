import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { aiService } from "../services/ai-service";
import { ChatRequest, ChatResponse } from "../types";
import { logger } from "../utils/logger";

export class ChatController {
    async sendMessge(req: Request, res: Response) {
        try{
            const { message, conversationId, provider = 'openai',customApiKey}: ChatRequest = req.body;
            const convoId = conversationId || uuidv4();
            const messages = [
                { role: 'user',content: message},
            ];
            const aiResponse = await aiService.generateResponse({
                messages,
                provider,
                apiKey: customApiKey,
                maxToken: 2000,
            });
            const response: ChatResponse = {
                reply: aiResponse.content,
                conversationId: convoId,
                tokenUsed: aiResponse.tokensUsed,
                provider: aiResponse.provider,
            };
            logger.info('Chat message processed',{
                conversationId: convoId,
                tokenUsed: aiResponse.tokensUsed,
                provider: aiResponse.provider,
            });
            res.json(response);
        } catch(error: any){
            logger.error('Chat controller error',error);
            res.status(500).json({
                error: 'Chat Error',
                message: error.message || 'Failed to generate response',
            });
        }
    }
    // need to complete that later on 
    async streamMessage(req:Request, res: Response){
        try {
            const { message, provider = 'openai',customApiKey} = req.query;
            if(!message || typeof message !== 'string'){
                return res.status(400).json({
                    error: 'Validation Error',
                    message: 'Message is required',
                });
            }
            const messages = [
                {role: 'user', content: message},
            ];
            await aiService.streamResonse(
                {
                    messages,
                    provider: provider as 'openai' | 'anthropic',
                    apiKey: customApiKey as string | undefined,
                    maxToken: 2000,
                },
                res
            );
            logger.info(`Streaming message completed`);

        } catch(error : any){
           logger.error(`Stream controller error`,error);
           if(!res.headersSent){ 
            res.status(501).json({
            error: 'Not  Implemeted',
            messages: 'Streaming is not yet Implemented',
        });
        }
    }
    }
}
export const chatController = new ChatController();