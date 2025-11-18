import { Request, Response } from "express";
import { aiService } from "../services/ai-service";
import { logger } from "../utils/logger";
import { ValidateKeyRequest } from "../types";
export class ValidationController {
    async validateApiKey(req: Request, res: Response){
        try {
            const { apiKey, provider}: ValidateKeyRequest = req.body;
            const isValid = await aiService.validateApiKey(apiKey,provider);
            if(isValid){
                res.json({
                    valid: true,
                    message: 'API key is valid',
                    provider,
                });
            } else {
                res.status(400).json({
                    valid: false,
                    message: 'API key is not valid',
                    provider,
                });
            } 
        } catch(error: any){
            logger.error(`Validation controller error`,error);
            res.status(500).json({
                valid: false,
                message: 'Failed to validate API key',
            });
        }
    }
}
export const validationController = new ValidationController();