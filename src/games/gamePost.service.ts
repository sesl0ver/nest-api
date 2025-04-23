import {BadRequestException, InternalServerErrorException, Injectable, NotFoundException} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {Decimal} from "decimal.js";
import {postData} from "../dto/post-data.dto";
import { ConfigService } from '@nestjs/config';
import { isValidInput, isValidXss } from '../lib/utils';
import * as fs from 'fs';
import * as path from 'path';
import {GamePost} from "../types/GamePost";

/*
입력 오류: BadRequestException (400)
서버나 DB 오류: InternalServerErrorException (500)
권한 부족: ForbiddenException (403)
인증 실패: UnauthorizedException (401)
일반 오류: HttpException을 활용하여 커스텀 메시지와 상태 코드 설정
 */

@Injectable()
export class GamePostService {
    constructor(private readonly prisma: PrismaService, private readonly configService: ConfigService) {}

    async createPost(game_id: string, dto: postData, files: Express.Multer.File[]) {
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

        try {
            await this.prisma.$transaction(async (tx) => {
                let post: GamePost;
                if (!dto.post_id) {
                    post = await tx.games_post.create({
                        data: {
                            title: _title,
                            contents: _contents,
                            post_type: dto.post_type,
                            author_id: Number(dto.author_id),
                            app_id: Number(game_id),
                        },
                    });
                } else {
                    post = await tx.games_post.update({
                        where: {
                            post_id: Number(dto.post_id)
                        },
                        data: {
                            title: _title,
                            contents: _contents,
                            post_type: dto.post_type,
                            author_id: Number(dto.author_id),
                            app_id: Number(game_id),
                        },
                    });
                }

                if (files && files.length > 0) {
                    const relativeFiles = files.map((file) => ({
                        original_name: file.originalname,
                        filename: file.filename,
                        path: file.path.replace(process.cwd(), ''),
                        size: file.size,
                        mime_type: file.mimetype,
                        post_id: post.post_id,
                    }));

                    await tx.uploaded_file.createMany({ data: relativeFiles });
                }

                return post;
            });
        } catch (e) {
            // 업로드 된 파일 확인 및 삭제
            try {
                for (const file of files) {
                    try {
                        await fs.promises.unlink(file.path);
                    } catch (err) {
                        if (err.code !== 'ENOENT') {
                            console.error(`파일 삭제 실패: ${file.path}`, err);
                        }
                    }
                }
            } catch (error) {
                console.error('Error deleting file', error);
            }
            // 오류 처리
            throw new InternalServerErrorException(e.message);
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

    async readPostGame(post_id: string) {
        return this.prisma.games_post.findUnique({
            where: { post_id: Number(post_id) },
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
                files: {
                    select: {
                        file_id: true,
                        filename: true,
                        size: true
                    }
                },
                comments: false
            },
        });
    }

    async remove(id: number) {
        return this.prisma.games_post.delete({
            where: { post_id: id },
        });
    }

    async removeGamePost (post_id: string) {
        try {
            await this.prisma.$transaction(async (tx) => {
                const remove = await tx.games_post.delete({
                    where: { post_id: Number(post_id) },
                    include: {
                        author: {
                            select: {
                                account_id: true,
                                username: true
                            }
                        },
                        game: false,
                        files: {
                            select: {
                                file_id: true,
                                path: true
                            }
                        },
                        comments: false
                    },
                });

                if (remove.files && remove.files.length > 0) {
                    const remove_file_id = remove.files.map(file => file.file_id);
                    await this.prisma.games_post.deleteMany({
                        where: {
                            post_id: { in: remove_file_id },
                        },
                    });

                    // 실제 파일 정리
                    for (const file of remove.files) {
                        await fs.promises.unlink(file.path);
                    }
                }
            });
        } catch (e) {
            // 오류 처리
            throw new InternalServerErrorException(e.message);
        }
    }

    async removePostFile (post_id: string, file_id: string) {
        try {
            await this.prisma.$transaction(async (tx) => {
                const file = await tx.uploaded_file.findFirst({
                    where: {
                        file_id: Number(file_id),
                        post_id: Number(post_id),
                    },
                });

                if (!file) {
                    throw new NotFoundException('파일이 존재하지 않거나 게시물과 매칭되지 않습니다.');
                }

                await tx.uploaded_file.delete({
                    where: { file_id: file.file_id },
                });

                const absolutePath = path.join(process.cwd(), file.path);
                await fs.promises.unlink(absolutePath);
            });
        } catch (e) {
            // 오류 처리
            throw new InternalServerErrorException(e.message);
        }
    }
}