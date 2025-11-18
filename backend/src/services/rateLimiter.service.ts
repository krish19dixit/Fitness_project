import { redisService } from "./redis-service";
import { RATE_LIMITS } from "../config/constants";

export class RateLimiterService {
    private getRateLimitKey(identifier: string, window: 'hour' | 'day'):string {
        const date = new Date();
        const hour = window === 'hour' ? date.getHours() : 0;
        const day = date.toISOString().split('T')[0];
        return `ratelimit:${identifier}:${day}:${hour}`;
    }
    async checkRateLimit(identifier: string, hasCustomKey: boolean):Promise<{
        allowed: boolean;
        used: number;
        limit: number;
        resetAt: Date;
    }> {
        if(hasCustomKey){
            return {
                allowed: true,
                used: 0,
                limit: -1,
                resetAt: new Date(),
            };
        }
        const hourkey = this.getRateLimitKey(identifier, 'hour');
        const limit = RATE_LIMITS.FREE.requestPerHour;
        const currentUsage = await redisService.get(hourkey);
        const used = currentUsage ? parseInt(currentUsage,10):0;

        if(used >= limit){
            const ttl = await redisService.ttl(hourkey);
            const resetAt = new Date(Date.now() + ttl * 1000);
            return {
                allowed: false,
                used,
                limit,
                resetAt,
            };
        }
        const newUsage = await redisService.incr(hourkey);
        if(newUsage === 1){
            await redisService.expire(hourkey,3600); // it is for 1 hour
        }
        const ttl = await redisService.ttl(hourkey);
        const resetAt = new Date(Date.now() + ttl * 1000);
        return {
            allowed: true,
            used: newUsage,
            limit,
            resetAt,
        };
    }
    async getUsageStats(identifier: string): Promise<{
        used: number;
        limit: number;
        resetAt: Date;
    }> {
        const hourkey = this.getRateLimitKey(identifier,'hour');
        const limit = RATE_LIMITS.FREE.requestPerHour;

        const currentUsage = await redisService.get(hourkey);
        const used = currentUsage ? parseInt(currentUsage, 10): 0;

        const ttl = await redisService.ttl(hourkey);
        const resetAt = new Date(Date.now() + (ttl > 0 ? ttl * 1000 : 3600000));
        return { used, limit, resetAt };
    }
}
export const rateLimitService = new RateLimiterService();
