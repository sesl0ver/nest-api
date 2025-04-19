import {Controller, Param, Body, Post, Delete, UploadedFile, UseInterceptors} from '@nestjs/common';
import {FileInterceptor} from '@nestjs/platform-express';
import {Express} from 'express';
import {ImageService} from './image.service';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { multerOptions } from "../common/multer.config";

const uploadPath = join(__dirname, '..', '..', 'uploads');

if (!existsSync(uploadPath)) {
    mkdirSync(uploadPath, { recursive: true });
}

@Controller('image')
export class ImageController {
    constructor(private readonly imageService: ImageService) {
    }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file', multerOptions))
    async uploadImage(@UploadedFile() file: Express.Multer.File) { // any 타입으로 처리
        const res = await this.imageService.uploadImage(file);
        return {
            ...res
        };
    }

    /*@Post('/remove/:id')
    async removeImage(@Param('id') id: string): Promise<any> { // any 타입으로 처리
        return this.imageService.imagekitRemoveImage(id);
    }*/

    // 원래는 Delete 이지만 sendBeacon은 Post 전용이므로
    @Post('/cleanup')
    async cleanupImages(@Body() body): Promise<void> {
        return this.imageService.removeImages(body);
    }
}
