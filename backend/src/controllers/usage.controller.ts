import { Request, Response } from "express";
import { rateLimitService } from "../services/rateLimiter.service";
import { logger } from "../utils/logger";
export class UsageController {
    async getUsageStats(req: Request, res: Response){
        try{
            const identifier = req.ip || req.socket.remoteAddress || 'unknown';
            const stats = await rateLimitService.getUsageStats(identifier);
            // incomplete
            res.json(stats);
        } catch(error){
            logger.error(`Usage controller error`,error);
            res.status(500).json({
                error: 'Usage Error',
                message:'Failed to retrieve usage statistics',
            });
        }
    }
}
export const usageController = new UsageController();