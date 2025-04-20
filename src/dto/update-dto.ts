import {IsNumber, IsOptional, IsString} from "class-validator";

export class postData {
    @IsNumber()
    readonly post_id: number;

    @IsOptional()
    @IsString()
    readonly title: string;

    @IsOptional()
    @IsString()
    readonly contents: string;

    @IsOptional()
    @IsString()
    readonly post_type: 'GUIDE' | 'REVIEW' | 'TIP' | 'QUESTION' | 'TALK' | 'NOTICE';

    @IsOptional()
    @IsString()
    readonly author_id: string;

    @IsOptional()
    @IsString()
    readonly app_id: string;

    @IsOptional()
    @IsString({ each: true })
    readonly prevUrl?: string[] | string;
}