import {Controller, Get, Post, Delete, Patch, Param, Body, Query} from '@nestjs/common';
import {GamesService} from "./games.service";
import {Game} from "./entities/game.entity";
import {CreateGameDto} from "./dto/create-game.dto";

@Controller('games')
export class GamesController {
    constructor(private readonly GamesService: GamesService) {
    }

    @Get()
    async getList(): Promise<Game[]> {
        return this.GamesService.getAll();
    }

    @Get(':id')
    async getOne(@Param('id') id: number): Promise<Game> {
        return this.GamesService.getOne(id);
    }

    @Post()
    async create(@Body() gameData: CreateGameDto) {
        await this.GamesService.create(gameData);
    }
}
