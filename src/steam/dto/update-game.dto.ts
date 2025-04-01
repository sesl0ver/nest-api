import {IsNumber, IsString} from "class-validator";
import {PartialType} from "@nestjs/mapped-types";
import {CreateGameDto} from "./create-game.dto";

export class UpdateGameDto {
    @IsString()
    readonly title: string;

    @IsString()
    readonly release_date: string;

    @IsString({ each: true })
    readonly genres: string[];
}