import {IsNumber, IsString} from "class-validator";
import {PartialType} from "@nestjs/mapped-types";
import {CreateGameDto} from "./create-game.dto";

export class UpdateGameDto extends PartialType(CreateGameDto) {

}