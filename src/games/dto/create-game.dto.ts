import {IsNumber, IsOptional, IsString} from "class-validator";

export class CreateGameDto {
    @IsNumber()
    readonly game_id: number;

    @IsString()
    readonly title: string;

    @IsString()
    readonly release_date: string;

    @IsString({ each: true })
    readonly genres: string[];
}