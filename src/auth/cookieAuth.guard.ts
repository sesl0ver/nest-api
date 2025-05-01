import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { verify } from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';
import {ConfigService} from '@nestjs/config';

const RECENT_CSRF_TOKENS = new Map<string, string>();

@Injectable()
export class CookieAuthGuard implements CanActivate {
    constructor(private readonly configService: ConfigService) {
    }
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest<Request>();
        const res = context.switchToHttp().getResponse<Response>();

        // ===== Access Token 검증 =====
        const authHeader = req.headers['authorization'];

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('No token provided');
        }
        const token = authHeader.split(' ')[1];
        let decoded: any;
        try {
            decoded = verify(token, this.configService.get<string>('NEST_API_JWT_SECRET_KEY', '')); // 실제 secret 사용
        } catch (err) {
            throw new UnauthorizedException('Invalid access token');
        }

        const account_id = decoded.account_id;
        if (!account_id) {
            throw new UnauthorizedException('Invalid access token payload');
        }

        // 요청 객체에 유저 정보 실어주기 (컨트롤러에서 사용 가능)
        req.user = decoded;

        return true;
    }
}