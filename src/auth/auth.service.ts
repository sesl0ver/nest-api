import {Injectable, UnauthorizedException} from '@nestjs/common';
import {PrismaService} from "../prisma/prisma.service";
import {Response} from 'express';
import {JwtService} from "@nestjs/jwt";
import {ConfigService} from '@nestjs/config';


@Injectable()
export class AuthService {
    constructor(private readonly prisma: PrismaService, private readonly jwtService: JwtService,
                private readonly configService: ConfigService,) {
    }

    // JWT 토큰 생성
    generateJwtToken(user: any): string {
        const payload = { account_id: user.account_id, username: user.username, avatar: user.avatar };

        // 토큰 생성 (1시간 만료)
        return this.jwtService.sign(payload, {
            secret: this.configService.get<string>('NEST_API_JWT_SECRET_KEY'),
            expiresIn: '1h',       // 만료 시간 설정 (1시간)
        });
    }

    loginProgress (account: any, res: Response) {
        if (! account) {
            return res.redirect('http://localhost:3000/login?auth=error');
        }
        const token = this.generateJwtToken(account);

        res.cookie('access_token', token, {
            httpOnly: true, // 클라이언트에서 접근 불가
            secure: this.configService.get<string>('NODE_ENV') === 'production', // HTTPS 환경에서만 쿠키 전송
            sameSite: 'lax',
            domain: this.configService.get<string>('COOKIE_DOMAIN'), // localhost와 그 서브도메인까지 쿠키 공유
            maxAge: 3600000, // 쿠키 만료 시간 (1시간)
        });

        // JWT 발급 or 쿠키 설정 후:
        return res.redirect('http://localhost:3000/login?auth=success');
    }

    verifyToken (authorization: string) {
        if (! authorization) {
            throw new UnauthorizedException('인증에 실패했습니다.');
        }
        const token = authorization.replace('Bearer ', ''); // "Bearer " 제거
        try {
            const user = this.jwtService.verify(token);  // JWT 토큰 검증
            return { user };  // 유저 정보 반환
        } catch (error) {
            throw new UnauthorizedException(error.message);
        }
    }
}