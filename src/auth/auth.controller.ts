import {Controller, Get, Headers, Req, Res, UseGuards} from '@nestjs/common';
import { Request, Response } from 'express';
import {AuthGuard} from "@nestjs/passport";
import {AuthService} from "./auth.service";

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {
    }

    @Get('/steam')
    @UseGuards(AuthGuard('steam'))
    steamLogin() {
        // 이건 자동 리디렉션됨
    }

    @Get('/steam/return')
    @UseGuards(AuthGuard('steam'))
    steamLoginRedirect(@Req() req: Request, @Res() res: Response) {
        const account = req['user'];
        return this.authService.loginProgress(account, res);
    }

    @Get('/verify')
    verify(@Headers('Authorization') authorization: string) {
        return this.authService.verifyToken(authorization);
    }
}