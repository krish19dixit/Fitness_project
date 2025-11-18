import { Request, Response, NextFunction } from "express";
import { rateLimitService } from "../services/rateLimiter.service";
import { logger } from "../utils/logger";
export const rateLimiterMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const identifier = req.ip || req.socket.remoteAddress || 'unknown';
        const hasCustomKey =!!req.body.customApiKey;
        const result=  await rateLimitService.checkRateLimit(identifier,hasCustomKey);
        if(!result.allowed){
            logger.warn(`Rate limit exceeded for ${identifier}`);
            return res.status(429).json({
                error: 'Rate limit exceeded',
                message: 'You have reched your hourly message limit. please try again later',
                used: result.used,
                limit: result.used,
                resetAt: result.resetAt,
            });
        }
        (req as any).UsageStats = result;
        next();
    } catch(error){
        logger.error(`Rate limiter middleware error`,error);
        next(error);
    }
};