import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        const status = exception instanceof HttpException
            ? exception.getStatus()
            : 500;

        const message = exception instanceof HttpException
            ? exception.getResponse()
            : 'Internal server error';

        response.status(status).json({
            success: false,
            error: message,
        });
    }
}
