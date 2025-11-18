import { Request, Response, NextFunction } from "express";
export const validateChatRequest = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const {message } = req.body;
    if(!message || typeof message !== 'string'){
        return res.status(400).json({
            error: 'Validation Error',
            message: 'Message is required and must be a strong',
        });
    }
    if( message.trim().length === 0){
        return res.status(400).json({
            error: 'Validation Error',
            message: 'Message cannot be empty',
        });
    }
    if(message.length > 2000){
        return res.status(400).json({
            error: 'Validation Error',
            message: 'Message cannot exceed 2000 characters',
        });
    }
    next();
};
export const ValidateKeyRequest = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { apiKey, provider } = req.body;
    if(!apiKey || typeof apiKey !== 'string'){
        return res.status(400).json({
            error: 'Validation Error',
            message:'API key is required',
        });
    }
    if(!provider || !['openai','anthropic'].includes(provider)){
        return res.status(400).json({
            error: 'Validation Error',
            message: 'Valid provider is required (openai or anthropic)',
        });
    }
    next();
};