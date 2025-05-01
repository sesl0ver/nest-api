import { Type } from 'class-transformer';
import {IsNotEmpty, IsOptional, IsString} from "class-validator";

export class postData {
    @IsOptional()
    @IsString()
    readonly post_id: string;

    @IsNotEmpty()
    @IsString()
    readonly title: string;

    @IsNotEmpty()
    @IsString()
    readonly contents: string;

    @IsNotEmpty()
    @IsString()
    readonly post_type: 'GUIDE' | 'REVIEW' | 'TIP' | 'QUESTION' | 'TALK' | 'NOTICE';

    @IsNotEmpty()
    @Type(() => String)
    @IsString()
    readonly app_id: string;

    @IsOptional()
    @IsString({ each: true })
    readonly prevUrl?: string[] | string;
}