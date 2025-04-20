import {BadRequestException, Injectable} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {Decimal} from "decimal.js";
import {postData} from "../dto/post-data.dto";
import { ConfigService } from '@nestjs/config';
import { isValidInput, isValidXss } from '../lib/utils';

@Injectable()
export class GamePostService {
    constructor(private readonly prisma: PrismaService, private readonly configService: ConfigService) {}

    async createPost(dto: postData, files: Express.Multer.File[]) {
        // TODO 이미지 포멧 체크 필요. 이미지 JPG, GIF, PNG, WEBP 만 업로드 가능.
        let update_content = dto.contents
        if (typeof dto.prevUrl === 'string') {
            for (const file of files) {
                update_content = update_content.replaceAll(dto.prevUrl, `${this.configService.get<string>('NEST_API_CLIENT_IMAGE_URL')}/${file.filename}`);
            }
        } else if (typeof dto.prevUrl === 'object') {
            for (const [index, file] of files.entries()) {
                update_content = update_content.replaceAll(dto.prevUrl[index], `${this.configService.get<string>('NEST_API_CLIENT_IMAGE_URL')}/${file.filename}`);
            }
        }

        // 태그 검사
        const _title = isValidXss(dto.title, {ALLOWED_TAGS: []});
        const _contents = isValidXss(update_content, {ALLOWED_TAGS: []});
        if (! isValidInput(_title)) {
            throw new BadRequestException('제목을 입력해주세요.');
        }
        if (! isValidInput(_contents)) {
            throw new BadRequestException('내용을 입력해주세요.');
        }

        const res = await this.prisma.games_post.create({ data: {
                title: _title,
                contents: _contents,
                post_type: dto.post_type,
                author_id: Number(dto.author_id),
                app_id: Number(dto.app_id),
            }
        });

        if (files) {
            for (const file of files) {
                const relativePath = file.path.replace(process.cwd(), '');
                await this.prisma.uploaded_file.create({
                    data: {
                        original_name: file.originalname,
                        filename: file.filename,
                        path: relativePath,
                        size: file.size,
                        mime_type: file.mimetype,
                        post_id: res.post_id
                    }
                });
            }
        }
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

    async findByGame(game_id: number , page: string) {
        let _page = new Decimal(page ?? '1')
        _page = (_page.isInteger()) ? _page : Decimal(1);
        const pageSize = 20;
        const skip = (_page.toNumber() - 1) * pageSize;
        const totalCount = await this.prisma.games_post.count({
            where: {
                app_id: game_id,
            },
        });
        const posts = await this.prisma.games_post.findMany({
            where: { app_id: game_id },
            skip: skip, // offset
            take: pageSize,
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
        return {
            totalCount: totalCount,
            totalPages: Math.ceil(totalCount / pageSize),
            currentPage: _page.toNumber(),
            pageSize: pageSize,
            posts: posts
        }
    }

    async readPostGame(id: number) {
        return this.prisma.games_post.findUnique({
            where: { post_id: id },
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
                comments: false
            },
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