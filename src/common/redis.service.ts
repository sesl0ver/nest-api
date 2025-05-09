import {Global, Injectable, OnModuleDestroy, OnModuleInit} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis, { Redis as RedisClient } from 'ioredis';

@Global()
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private client: RedisClient;

    constructor(private readonly configService: ConfigService) {}

    onModuleInit() {
        this.client = new Redis({
            host: this.configService.get<string>('NEST_API_REDIS_HOST', '127.0.0.1'),
            port: this.configService.get<number>('NEST_API_REDIS_PORT', 6379),
            password: this.configService.get<string>('NEST_API_REDIS_PASSWORD'),
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

    async exists(key: string): Promise<boolean> {
        const exists = await this.client.exists(key);
        return exists > 0;
    }

    async incr(key: string): Promise<number> {
        return this.client.incr(key);
    }

    async decr(key: string): Promise<number> {
        return this.client.decr(key);
    }

    onModuleDestroy() {
        this.client.quit();
    }
}