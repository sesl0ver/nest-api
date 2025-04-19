import {Injectable} from '@nestjs/common';
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ImageService {
    constructor(private readonly prisma: PrismaService) {}

    async uploadImage(file: Express.Multer.File) {
        const relativePath = file.path.replace(process.cwd(), '');
        return this.prisma.uploaded_file.create({
            data: {
                original_name: file.originalname,
                filename: file.filename,
                path: relativePath,
                size: file.size,
                mime_type: file.mimetype,
            },
            select: {
                file_id: true,
                filename: true,
                size: true,
            }
        });
    }

    async removeImages(body) {
        console.log('Removing image...', body);
    }
}