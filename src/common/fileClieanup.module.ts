import { Module } from '@nestjs/common';
import { FileCleanupService } from './fileClieanup.service';
import { PrismaService } from '../prisma/prisma.service'; // Prisma 서비스

@Module({
    providers: [FileCleanupService, PrismaService],
})
export class FileModule {}
