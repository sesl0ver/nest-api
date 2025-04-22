import { diskStorage } from 'multer';
import { extname } from 'path';
import {join} from 'path';
import {BadRequestException} from "@nestjs/common";

const allowedImageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']; // 확장 가능!

const imageFileFilter = (req, file, callback) => {
    const ext = extname(file.originalname).toLowerCase();

    if (!allowedImageExtensions.includes(ext)) {
        return callback(
            new BadRequestException(
                `허용되지 않는 파일 형식입니다. (${allowedImageExtensions.join(', ')})`,
            ),
            false,
        );
    }

    // MIME 타입 이중 체크
    if (!file.mimetype.startsWith('image/')) {
        return callback(new BadRequestException('이미지 파일만 업로드할 수 있습니다.'), false);
    }

    callback(null, true);
}

export const multerOptions = {
    storage: diskStorage({
        destination: (req, file, callback) => {
            callback(null, join(process.cwd(), 'public', 'uploads'));
        },
        filename: (req, file, callback) => {
            function generateUniqueId() {
                return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
            }
            const ext = extname(file.originalname); // 확장자 추출
            const filename = `${generateUniqueId()}${ext}`; // 고유한 이름으로 변경
            callback(null, filename);
        },
    }),
    fileFilter: imageFileFilter,
};