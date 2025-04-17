import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GamePostService {
    constructor(private readonly prisma: PrismaService) {}

    async createPost(dto: {
        title: string,
        contents: string,
        port_type: 'GUIDE' | 'REVIEW' | 'TIP' | 'QUESTION',
        author_id: number,
        app_id: number
    }) {
        return this.prisma.games_post.create({ data: dto });
    }

    async findPostAll() {
        return this.prisma.games_post.findMany({
            orderBy: { created_date: 'desc' },
            include: {
                author: {
                    select: {
                        account_id: true,
                        username: true
                    }
                },
                game: {
                    select: {
                        app_id: true,
                        title: true
                    }
                },
                _count: {
                    select: {
                        comments: true
                    }
                }
            },
        });
    }

    async findByGame(game_id: number) {
        return this.prisma.games_post.findMany({
            where: { app_id: game_id },
            orderBy: { created_date: 'desc' },
            include: {
                author: {
                    select: {
                        account_id: true,
                        username: true
                    }
                },
                game: {
                    select: {
                        app_id: true,
                        title: true
                    }
                },
                _count: {
                    select: {
                        comments: true
                    }
                }
            },
        });
    }

    async findOne(id: number) {
        return this.prisma.games_post.findUnique({
            where: { post_id: id },
            include: {
                comments: true,
                author: true,
                game: true,
            }
        });
    }

    async update(id: number, dto: Partial<{ title: string, contents: string, port_type: 'GUIDE' | 'REVIEW' | 'TIP' | 'QUESTION' }>) {
        return this.prisma.games_post.update({
            where: { post_id: id },
            data: dto,
        });
    }

    async remove(id: number) {
        return this.prisma.games_post.delete({
            where: { post_id: id },
        });
    }
}