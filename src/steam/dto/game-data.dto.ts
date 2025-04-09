import {IsNumber, IsOptional, IsString} from "class-validator";

export class gameData {
    @IsNumber()
    readonly app_id: number;

    @IsString()
    readonly title: string;

    @IsString()
    readonly short_description: string;

    @IsString()
    readonly detailed_description: string;

    @IsString()
    readonly about_the_game: string;

    @IsString()
    readonly header_image: string;

    @IsString()
    readonly release_date: string;

    @IsString({ each: true })
    readonly developers: string[];

    @IsString({ each: true })
    readonly publishers: string[];

    @IsString({ each: true })
    readonly genres: string[];

    @IsString({ each: true })
    readonly screenshots: string[];

    @IsString({ each: true })
    readonly movies: string[];

    @IsString()
    readonly background: string;

    @IsOptional()
    readonly create_date: string;
}