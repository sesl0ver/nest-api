export interface wrapResult<T> {
    success: boolean;
    error?: string;
    code?: number
    data?: T;
}