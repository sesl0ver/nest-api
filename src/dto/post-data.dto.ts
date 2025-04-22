import { Type } from 'class-transformer';
import {IsNotEmpty, IsOptional, IsString} from "class-validator";

export class postData {
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
    readonly author_id: string;

    @IsNotEmpty()
    @Type(() => String)
    @IsString()
    readonly app_id: string;

    @IsOptional()
    @IsString({ each: true })
    readonly prevUrl?: string[] | string;
}