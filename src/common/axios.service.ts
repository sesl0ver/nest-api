import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { Observable, firstValueFrom, catchError, throwError } from 'rxjs';

@Injectable()
export class AxiosService {
    constructor(private readonly httpService: HttpService) {}

    private async handleRequest<T>(
        observable: Observable<AxiosResponse<T>>
    ): Promise<T | AxiosResponse<T>> {
        return firstValueFrom(
            observable.pipe(
                catchError((error: AxiosError) => {
                    const message = error.response?.data || error.message;
                    const status = error.response?.status || 500;
                    return throwError(() => new InternalServerErrorException({
                        message: 'HTTP Request Failed.',
                        error: message,
                        status,
                    }));
                }),
            )
        );
    }

    async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T | AxiosResponse<T>> {
        return this.handleRequest<T>(this.httpService.get<T>(url, config));
    }

    async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T | AxiosResponse<T>> {
        return this.handleRequest<T>(this.httpService.post<T>(url, data, config));
    }

    async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T | AxiosResponse<T>> {
        return this.handleRequest<T>(this.httpService.put<T>(url, data, config));
    }

    async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T | AxiosResponse<T>> {
        return this.handleRequest<T>(this.httpService.delete<T>(url, config));
    }

    async request<T = any>(config: AxiosRequestConfig): Promise<T | AxiosResponse<T>> {
        return this.handleRequest<T>(this.httpService.request<T>(config));
    }
}