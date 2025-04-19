import {IsNumber, IsOptional, IsString} from "class-validator";

export class postData {
    @IsString()
    readonly title: string;

    @IsString()
    readonly contents: string;

    @IsString()
    readonly post_type: 'GUIDE' | 'REVIEW' | 'TIP' | 'QUESTION' | 'TALK' | 'NOTICE';

    @IsString()
    readonly author_id: string;

    @IsString()
    readonly app_id: string;

    @IsOptional()
    @IsString({ each: true })
    readonly prevUrl?: string[] | string;
}