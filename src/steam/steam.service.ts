import {Injectable, NotFoundException, BadRequestException} from '@nestjs/common';
import {PrismaService} from "../prisma/prisma.service";
import {steamGame} from "./entities/steam.entity";
import {AxiosService} from "../common/axios.service";

@Injectable()
export class SteamService {
    constructor(private prisma: PrismaService, private axiosService: AxiosService) {
    }

    async getSteamGames(limit: number = 20): Promise<steamGame[]> {
        return this.prisma.games.findMany({
            select: {
                app_id: true,
                title: true,
                short_description: true,
                capsule_image: true,
                header_image: true,
                developers: true,
                publishers: true,
                genres: true,
                release_date: true,
            },
            skip: 0, // offset
            take: limit,
        });
    }

    /*async getSteamGame(appid: number): Promise<steamGame> {
        try {
            await this.pg.query(`SELECT ${this.gamesColumn.join(',')} FROM games WHERE app_id = $1`, [appid]);
        } catch (e) {
            throw new BadRequestException(e.message);
        }
        let result = this.pg.getRows();
        if (result.rowCount < 1) {
            // result = await this.createSteamGame(appid);
            throw new NotFoundException(`This game is not registered. (${appid})`);
        }
        const data = result.rows[0];
        return {
            app_id: data.app_id,
            title: data.title,
            short_description: data.short_description,
            detailed_description: data.detailed_description,
            about_the_game: data.about_the_game,
            header_image: data.header_image,
            release_date: data.release_date,
            developers: data.developers,
            publishers: data.publishers,
            genres: data.genres,
            screenshots: data.screenshots,
            screenshots_full: data.screenshots_full,
            movies: data.movies,
            movies_full: data.movies_full
        };
    }*/

    async createSteamGame (appid: number): Promise<void> {
        const response = await this.axiosService.get(`https://store.steampowered.com/api/appdetails?appids=${appid}&l=koreana&cc=kr`);
        const { data } = response.data[appid];
        if (! data || response.data[appid]['success'] !== true) {
            throw new NotFoundException(`Appid ${appid} game not found.`);
        }
        if (Array.isArray(data.content_descriptors['ids'])) {
            for (let o of data.content_descriptors['ids']) {
                if ([3, 4].includes(o)) {
                    throw new BadRequestException(`Adult games cannot be registered. (${appid})`);
                }
            }
        }
        if (data.type !== 'game') {
            throw new BadRequestException(`Only game types on Steam can be registered. (${appid})`);
        }
        const res: steamGame = { ...data, app_id: data.steam_appid, title: data.name };
        await this.prisma.games.create({
            data: {
                app_id: res.app_id,
                title: res.title,
                short_description: res.short_description,
                detailed_description: res.detailed_description,
                capsule_image: res.capsule_image,
                about_the_game: res.about_the_game,
                header_image: res.header_image,
                release_date: res.release_date['date'],
                developers: res.developers.map((d: string) => d),
                publishers: res?.publishers?.map((d: string) => d) ?? [],
                genres: res.genres.map((d: string) => d['description']),
                screenshots: res?.screenshots?.map((d: string) => d['path_thumbnail']) ?? [],
                screenshots_full: res?.screenshots?.map((d: string) => d['path_full']) ?? [],
                movies: res?.movies?.map((d: string) => d['mp4'][480]) ?? [],
                movies_full: res?.movies?.map((d: string) => d['mp4']['max']) ?? []
            }
        });
    }
}