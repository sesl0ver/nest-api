import {Controller, Get, Post, Param, Query, Body, UploadedFiles, UseInterceptors} from '@nestjs/common';
import {GamesService} from "./games.service";
import {steamGame, steamGamePage} from "../entities/game.entity";
import {GamePostService} from "../gamepost/gamePost.service";
import { multerOptions } from "../common/multer.config";
import {FilesInterceptor} from "@nestjs/platform-express";
import {postData} from "../dto/post-data.dto";

@Controller('games')
export class GamesController {
    constructor(private readonly gamesService: GamesService, private readonly gamePostService: GamePostService) {
    }

    @Get()
    async getGames(@Query('page') page: string):Promise<steamGamePage> {
        return this.gamesService.getGames(page);
    }

    @Get(':appid')
    async getGame(@Param('appid') appid: number): Promise<steamGame> {
        return this.gamesService.getGame(appid);
    }

    @Get('/posts/:appid')
    findPostGame(@Param('appid') appid: string, @Query('page') page: string) {
        return this.gamePostService.findByGame(Number(appid), page);
    }

    @Get('/read/:post_id')
    readPostGame(@Param('post_id') post_id: string) {
        return this.gamePostService.readPostGame(Number(post_id));
    }

    @Post(':appid')
    async createSteamGame(@Param('appid') appid: number): Promise<void> {
        await this.gamesService.createGame(appid);
    }

    @Post('/post')
    @UseInterceptors(FilesInterceptor('files', 10, multerOptions))
    createPost(@Body() dto: postData, @UploadedFiles() files: Express.Multer.File[]) {
        return this.gamePostService.createPost(dto, files);
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
