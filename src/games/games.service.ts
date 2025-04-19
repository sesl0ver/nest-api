import {Injectable, NotFoundException} from '@nestjs/common';
import {PrismaService} from "../prisma/prisma.service";
import {steamGame, priceOverview, steamGamePage} from "../entities/game.entity";
import {SteamService} from "../common/steam.service";
import {DealService} from "../common/deal.service";
import {Decimal} from "decimal.js";


@Injectable()
export class GamesService {
    constructor(private prisma: PrismaService, private readonly steamService: SteamService,
                private readonly dealService: DealService) {
    }

    async getGames(page: string): Promise<steamGamePage> {
        let _page = new Decimal(page ?? '1')
        _page = (_page.isInteger()) ? _page : Decimal(1);
        const pageSize = 9;
        const skip = (_page.toNumber() - 1) * pageSize;
        const totalCount = await this.prisma.games.count();
        const games = await this.prisma.games.findMany({
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
            skip: skip, // offset
            take: pageSize,
        });

        return {
            totalCount: totalCount,
            totalPages: Math.ceil(totalCount / pageSize),
            currentPage: _page.toNumber(),
            pageSize: pageSize,
            games: games
        }
    }

    async getGame(appid: number): Promise<steamGame> {
        const data: steamGame | null = await this.prisma.games.findUnique({
            where: { app_id: appid },
            select: {
                app_id: true,
                title: true,
                short_description: true,
                screenshots: true,
                capsule_image: true,
                header_image: true,
                developers: true,
                publishers: true,
                genres: true,
                release_date: true,
            }
        });
        if (! data) {
            throw new NotFoundException(`This game is not registered. (${appid})`);
        }
        return {
            app_id: data.app_id,
            title: data.title,
            short_description: data.short_description,
            capsule_image: data.capsule_image,
            header_image: data.header_image,
            release_date: data.release_date,
            developers: data.developers,
            publishers: data.publishers,
            genres: data.genres,
            screenshots: data.screenshots,
            screenshots_full: data.screenshots_full,
            movies: data.movies,
            movies_full: data.movies_full
        }
    }

    async createGame (appid: number): Promise<void> {
        const res = await this.steamService.fetchDetails(appid);
        await this.prisma.games.upsert({
            where: {
                app_id: res.app_id
            },
            update: {
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
            },
            create: {
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

    async getPrice (appid: number): Promise<priceOverview> {
        return this.dealService.fetchPriceOverview(String(appid));
    }
}
