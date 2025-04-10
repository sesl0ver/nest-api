import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {Postgres} from "../class/postgres";
import defaultAxios, {AxiosInstance, AxiosResponse} from "axios";
import {steamGame} from "./entities/steamGame.entity";

@Injectable()
export class SteamService {
    private axiosInstance: AxiosInstance = defaultAxios.create({
        timeout: 30000
    });
    private pg: Postgres = new Postgres();
    private gamesColumn = ['app_id', 'title', 'short_description', 'detailed_description', 'about_the_game',
        'header_image','release_date', 'developers', 'publishers', 'genres', 'screenshots', 'screenshots_full', 'movies', 'movies_full'];

    async getSteamGames(limit: number = 20): Promise<steamGame[]> {
        try {
            await this.pg.query(`SELECT ${this.gamesColumn.join(',')} FROM games ORDER BY app_id DESC LIMIT $1`, [limit]);
        } catch (e) {
            throw new BadRequestException(e.message);
        }
        let result = this.pg.getRows();
        return result.rows;
    }

    async getSteamGame(appid: number): Promise<steamGame> {
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
    }

    async createSteamGame (appid: number): Promise<{ rowCount: number, rows: steamGame[] }> {
        const response: AxiosResponse = await this.axiosInstance.get(`https://store.steampowered.com/api/appdetails?appids=${appid}&l=koreana&cc=kr`);
        const data = response.data[appid]?.data;
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
        await this.pg.query(`INSERT INTO games (${this.gamesColumn.join(',')}) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING ${this.gamesColumn.join(',')}`,
            [
                data.steam_appid, data.name, data.short_description, data.detailed_description, data.about_the_game, data.header_image,
                data.release_date['date'],
                data.developers.map((d: string) => d),
                data.publishers.map((d: string) => d),
                data.genres.map((d: string) => d['description']),
                data.screenshots.map((d: string) => d['path_thumbnail']),
                data.screenshots.map((d: string) => d['path_full']),
                data.movies.map((d: string) => d['mp4'][480]),
                data.movies.map((d: string) => d['mp4']['max'])
            ]);
        // await this.pg.query('SELECT * FROM games WHERE app_id = $1', [appid]);
        return this.pg.getRows();
    }
}
