import { diskStorage } from 'multer';
import { extname } from 'path';
import {join} from 'path';

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
};