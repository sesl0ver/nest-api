import {Controller, Get, Post, Param, Req, Body, Put, Delete} from '@nestjs/common';
import {GamesService} from "./games.service";
import {priceOverview, steamGame} from "../entities/game.entity";
import {GamePostService} from "../gamepost/gamePost.service";

@Controller('games')
export class GamesController {
    constructor(private readonly gamesService: GamesService, private readonly gamePostService: GamePostService) {
    }

    @Get()
    async getGames():Promise<steamGame[]> {
        return this.gamesService.getGames();
    }

    @Get('/posts/:game_id')
    findPostGame(@Param('game_id') game_id: string) {
        return this.gamePostService.findByGame(Number(game_id));
    }

    @Get(':appid')
    async getGame(@Param('appid') appid: number): Promise<steamGame> {
        return this.gamesService.getGame(appid);
    }

    @Post('/post')
    createPost(@Body() dto: any) {
        return this.gamePostService.createPost(dto);
    }

    @Post(':appid')
    async createSteamGame(@Param('appid') appid: number): Promise<void> {
        await this.gamesService.createGame(appid);
    }

    /*@Get(':id')
    findOne(@Param('id') id: string) {
        return this.gamePostService.findOne(Number(id));
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() dto: any) {
        return this.gamePostService.update(Number(id), dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.gamePostService.remove(Number(id));
    }*/
}
