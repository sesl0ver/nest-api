import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const isDev = process.env.NODE_ENV === 'development';

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let clientMessage = 'Internal server error';
        let debugMessage: string | undefined;
        let stack: string[] | undefined;
        let extraErrorInfo: any = {};

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const res = exception.getResponse();

            if (typeof res === 'string') {
                clientMessage = res;
            } else if (typeof res === 'object' && res !== null) {
                const { message, ...rest } = res as any;
                clientMessage = message ?? clientMessage;
                extraErrorInfo = rest;
            }
        } else if (exception instanceof Error) {
            clientMessage = 'Unexpected error occurred';
            debugMessage = exception.message;
            stack = exception.stack?.split('\n').map(line => line.trim());
        } else {
            // unknown error
            debugMessage = JSON.stringify(exception);
        }

        const responseBody: any = {
            success: false,
            statusCode: status,
            message: clientMessage,
        };

        // 개발 환경에서만 디버깅 정보 포함
        if (isDev) {
            responseBody.debug = {
                path: request.url,
                method: request.method,
                timestamp: new Date().toISOString(),
                ...(debugMessage && { message: debugMessage }),
                ...(stack && { stack }),
                ...(Object.keys(extraErrorInfo).length ? { error: extraErrorInfo } : {}),
            };
        }

        response.status(status).json(responseBody);
    }
}
