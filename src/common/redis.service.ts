import {Global, Injectable, OnModuleDestroy, OnModuleInit} from '@nestjs/common';
import Redis, { Redis as RedisClient } from 'ioredis';
import { config } from "dotenv";

@Global()
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private client: RedisClient;

    onModuleInit() {
        config()
        this.client = new Redis({
            host: process.env.NEST_API_REDIS_HOST ?? "127.0.0.1",
            port: Number(process.env.NEST_API_REDIS_PORT) ?? 6379,
            password: process.env.NEST_API_REDIS_PASSWORD,
        });

        this.client.on('connect', () => {
            // console.log('Redis connected');
        });

        this.client.on('error', (err) => {
            console.error('Redis error:', err);
        });
    }

    async set(key: string, value: string, ttlInSeconds?: number): Promise<void> {
        if (ttlInSeconds) {
            await this.client.set(key, value, 'EX', ttlInSeconds);
        } else {
            await this.client.set(key, value);
        }
    }

    async get(key: string): Promise<string | null> {
        return this.client.get(key);
    }

    async del(key: string): Promise<number> {
        return this.client.del(key);
    }

    onModuleDestroy() {
        this.client.quit();
    }
}