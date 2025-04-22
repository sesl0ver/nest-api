import {Controller, Get, Post, Put, Delete, Param, Query, Body, UploadedFiles, UseInterceptors} from '@nestjs/common';
import {GamesService} from "./games.service";
import {steamGame, steamGamePage} from "../entities/game.entity";
import {GamePostService} from "./gamePost.service";
import { multerOptions } from "../common/multer.config";
import {FilesInterceptor} from "@nestjs/platform-express";
import {postData} from "../dto/post-data.dto";
import {DealService} from "../common/deal.service";

@Controller('api')
export class GamesController {
    constructor(private readonly gamesService: GamesService, private readonly gamePostService: GamePostService) {
    }

    @Get('/games')
    async getGames(@Query('page') page: string):Promise<steamGamePage> {
        return this.gamesService.getGames(page);
    }

    @Get('/games/:app_id')
    async getGame(@Param('app_id') app_id: number): Promise<steamGame> {
        return this.gamesService.getGame(app_id);
    }

    @Get('/games/:app_id/posts')
    findPostGame(@Param('app_id') app_id: string, @Query('page') page: string) {
        return this.gamePostService.findByGame(Number(app_id), page);
    }

    @Get('/games/:app_id/posts/:post_id')
    readPostGame(@Param('post_id') post_id: string) {
        return this.gamePostService.readPostGame(post_id);
    }

    @Get('/games/price/:game_id')
    getPrice(@Param('game_id') game_id: string) {
        return this.gamesService.getPrice(game_id);
    }

    @Post('/games/:game_id/posts')
    @UseInterceptors(FilesInterceptor('files', 10, multerOptions))
    createPost(@Param('game_id') game_id: string, @Body() dto: postData, @UploadedFiles() files: Express.Multer.File[]) {
        return this.gamePostService.createPost(game_id, dto, files);
    }

    @Post('/games/:appid')
    async createSteamGame(@Param('appid') appid: number): Promise<void> {
        await this.gamesService.createGame(appid);
    }

    @Delete('/games/posts/:post_id')
    removeGamePost(@Param('post_id') post_id: string) {
        return this.gamePostService.removeGamePost(post_id);
    }

    @Delete('/games/posts/:post_id/files/:file_id')
    removePostFile(@Param('post_id') post_id: string, @Param('file_id') file_id: string) {
        return this.gamePostService.removePostFile(post_id, file_id);
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
