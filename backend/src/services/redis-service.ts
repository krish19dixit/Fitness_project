import { Redis } from "ioredis";
import { logger } from "../utils/logger";

class RedisService {
    private client: Redis | null = null;
    async connect(){
        try {
            this.client= new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
              maxRetriesPerRequest: 3,
              retryStrategy: (times:number) => {
                const delay = Math.min(times * 50, 20000);
                return delay;
              },
            });

            this.client.on('connect',() => {
                logger.info('Redis connected Successfully');
            });

            this.client.on('error', (err) => {
                logger.error('Redis conneted successfully');
            });

            return this.client;
        } catch (error){
            logger.error('Failed to connect to Redis',error);
            throw error;
        }
    }
    async get(key: string): Promise<string | null > {
        if(!this.client){
            throw new Error('Redis client not initialize');
        }
        return this.client?.get(key);
    }
    async set(key: string, value: string, expirySeconds?: number): Promise<void>{
        if(!this.client){
            throw new Error('Redis client not initialize');
        }
        if(expirySeconds){
            await this.client.set(key,value,'EX',expirySeconds);
        } else {
            await this.client.set(key, value);
        }
    }
    async incr (key: string): Promise<number>{
        if(!this.client){
            throw new Error('Redis client not initialize');
        }
        return this.client.incr(key);
    }
    async expire(key: string, second: number): Promise<void>{
        if(!this.client){
            throw new Error('Redis client not initialize');
        }
        await this.client.expire(key, second);
    }
    async ttl(key: string): Promise<number>{
        if(!this.client){
            throw new Error('Redis is not initialize');
        }
        return this.client.ttl(key);
    }
    async disconnect(){
        if(this.client){
            await this.client.quit();
        }
    }
}
export const redisService = new RedisService();