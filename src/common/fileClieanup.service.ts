import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class FileCleanupService {
    constructor(private readonly prisma: PrismaService) {}

    // 미사용 파일을 삭제하는 메서드
    async removeUnusedFiles() {
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        const unusedFiles = await this.prisma.uploaded_file.findMany({
            where: {
                post_id: null, // 게시물에 연결되지 않은 파일 찾기,
                created_date: {
                    lt: oneDayAgo, // 하루 전보다 이전에 생성된 파일
                },
            },
        });

        for (const file of unusedFiles) {
            try {
                await unlink(join(process.cwd(), file.path));
                await this.prisma.uploaded_file.delete({ where: { file_id: file.file_id } });
            } catch (e) {
                console.error(`파일 삭제 실패: ${file.path}`, e);
            }
        }
    }

    @Cron('0 */1 * * *')
    async handleCron() {
        await this.removeUnusedFiles();
    }
}