import {Controller, Get, Post, Param} from '@nestjs/common';
import {steamGame} from "./entities/steamGame.entity";
import {SteamService} from "./steam.service";

@Controller('steam')
export class SteamController {
    constructor(private readonly SteamService: SteamService) {
    }

    @Get()
    async getSteamGames(): Promise<steamGame[]> {
        return this.SteamService.getSteamGames();
    }

    @Get(':appid')
    async getSteamGame(@Param('appid') appid: number): Promise<steamGame> {
        return this.SteamService.getSteamGame(appid);
    }

    @Post(':appid')
    async createSteamGame(@Param('appid') appid: number): Promise<void> {
        await this.SteamService.createSteamGame(appid);
    }
}
