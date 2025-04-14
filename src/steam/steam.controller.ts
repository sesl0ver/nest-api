import {Controller, Get, Post, Param, Req } from '@nestjs/common';
import {SteamService} from "./steam.service";
import {steamGame} from "./entities/steam.entity";

@Controller('steam')
export class SteamController {
    constructor(private readonly SteamService: SteamService) {
    }

    @Get()
    async getSteamGames():Promise<steamGame[]> {
        return this.SteamService.getSteamGames();
    }

    /*@Get(':appid')
    async getSteamGame(@Param('appid') appid: number): Promise<steamGame> {
        return this.SteamService.getSteamGame(appid);
    }*/

    @Post(':appid')
    async createSteamGame(@Param('appid') appid: number): Promise<void> {
        await this.SteamService.createSteamGame(appid);
    }
}
