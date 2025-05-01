import { Injectable } from '@nestjs/common';
import {PrismaService} from "../prisma/prisma.service";

@Injectable()
export class AccountService {
    constructor(private prisma: PrismaService) {
    }

    async findBySteamId (steam_id: string) {
        return this.prisma.account.findUnique({
            where: {
                steam_id: steam_id
            },
            select: {
                account_id: true,
                steam_id: true,
                username: true,
                avatar: true,
                created_date: true,
            }
        });
    }

    async createSteamAccount ({ steam_id, username, avatar }: { steam_id: string, username: string, avatar: string }) {
        return this.prisma.account.create({
            data: {
                steam_id: steam_id,
                password: '',
                username: username,
                avatar: avatar,
            }
        });
    }
}