import {
    BadRequestException,
    InternalServerErrorException,
    Injectable,
    NotFoundException,
    ConflictException, UnauthorizedException
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {Decimal} from "decimal.js";
import {postData} from "../dto/post-data.dto";
import { ConfigService } from '@nestjs/config';
import { isValidInput, isValidXss } from '../lib/utils';
import * as fs from 'fs';
import * as path from 'path';
import {GamePost} from "../types/GamePost";
import {RedisService} from "../common/redis.service";

/*
입력 오류: BadRequestException (400)
서버나 DB 오류: InternalServerErrorException (500)
권한 부족: ForbiddenException (403)
인증 실패: UnauthorizedException (401)
일반 오류: HttpException을 활용하여 커스텀 메시지와 상태 코드 설정
 */

@Injectable()
export class GamePostService {
    constructor(private readonly prisma: PrismaService, private readonly redisService: RedisService, private readonly configService: ConfigService) {}

    async createPost(game_id: string, dto: postData, files: Express.Multer.File[], account_id: number) {
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
            return this.prisma.$transaction(async (tx) => {
                let post: GamePost;
                if (!dto.post_id) {
                    post = await tx.games_post.create({
                        data: {
                            title: _title,
                            contents: _contents,
                            post_type: dto.post_type,
                            author_id: account_id,
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
                            author_id: account_id,
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

                return { post_id: post.post_id };
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
                _count: {
                    select: {
                        likes: true,
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

    async removeGamePost (post_id: string, account_id: number) {
        try {
            await this.prisma.$transaction(async (tx) => {
                const remove = await tx.games_post.findUnique({
                    where: { post_id: Number(post_id), author_id: account_id },
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
                if (! remove) {
                    throw new NotFoundException('이미 삭제되었거나 존재하지 않는 게시물입니다.');
                }

                if (remove.files && remove.files.length > 0) {
                    const remove_file_id = remove.files.map(file => file.file_id);
                    await this.prisma.uploaded_file.deleteMany({
                        where: {
                            file_id: { in: remove_file_id },
                        },
                    });

                    // 실제 파일 정리
                    for (const file of remove.files) {
                        const absolutePath = path.join(process.cwd(), file.path);
                        await fs.promises.unlink(absolutePath);
                    }
                }
                await tx.games_post_like.delete({ where: { post_id: Number(post_id) } });
                await tx.games_post.delete({ where: { post_id: Number(post_id) } });
            });
        } catch (e) {
            // 오류 처리
            console.error(e)
            throw new InternalServerErrorException(e.message);
        }
    }

    async removePostFile (post_id: string, file_id: string, account_id: string) {
        try {
            await this.prisma.$transaction(async (tx) => {
                const count = await this.prisma.games_post.count({
                    where: { post_id: Number(post_id), author_id: Number(account_id) },
                });
                if (count < 1) {
                    throw new UnauthorizedException('파일 삭제 권한이 없습니다.');
                }

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

    async likePost (post_id: string, account_id: number): Promise<{ count: number }> {
        const likeUserKey = `like:${post_id}:${account_id}`;
        const likeCountKey = `like_count:${post_id}`;

        const postId = Number(post_id);

        // 1. Redis 먼저 체크 (중복 방지 캐시)
        const isCached = await this.redisService.exists(likeUserKey);
        if (isCached) {
            throw new ConflictException("이미 좋아요를 눌렀습니다.");
        }

        // 2. DB에서 최종 중복 확인 (TTL 만료되었을 가능성 대비)
        const alreadyLiked = await this.prisma.games_post_like.count({
            where: {
                post_id: postId,
                account_id: account_id,
            },
        });

        if (alreadyLiked > 0) {
            await this.redisService.set(likeUserKey, "1", 60 * 60 * 24);
            throw new ConflictException("이미 좋아요를 눌렀습니다.");
        }

        // 3. 좋아요 등록
        // 3. 트랜잭션으로 DB 동기화 처리
        const [, updatedPost] = await this.prisma.$transaction([
            this.prisma.games_post_like.create({
                data: {
                    post_id: postId,
                    account_id: account_id,
                },
            }),
            this.prisma.games_post.update({
                where: { post_id: postId },
                data: {
                    like_count: {
                        increment: 1,
                    },
                },
            }),
        ]);

        // 4. Redis 업데이트
        await this.redisService.set(likeUserKey, "1", 60 * 60 * 24); // 중복 방지 캐시
        if (await this.redisService.exists(likeCountKey)) {
            await this.redisService.incr(likeCountKey);
        }

        return { count: updatedPost.like_count };
    }
}