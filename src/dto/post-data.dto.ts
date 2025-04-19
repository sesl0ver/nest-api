import {IsNumber, IsOptional, IsString} from "class-validator";

export class postData {
    @IsString()
    readonly title: string;

    @IsString()
    readonly contents: string;

    @IsString()
    readonly post_type: 'GUIDE' | 'REVIEW' | 'TIP' | 'QUESTION' | 'TALK' | 'NOTICE';

    @IsNumber()
    readonly author_id: number;

    @IsNumber()
    readonly app_id: number;

    @IsOptional()
    @IsString({ each: true })
    readonly prevUrl?: string[] | string;
}