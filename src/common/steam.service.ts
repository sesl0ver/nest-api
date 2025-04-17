import {Injectable, NotFoundException, BadRequestException} from '@nestjs/common';
import {steamGame} from "../entities/game.entity";
import {AxiosService} from "./axios.service";
import {RedisService} from "./redis.service";

@Injectable()
export class SteamService {
    constructor(private readonly axiosService: AxiosService, private readonly redisService: RedisService) {
    }

    async fetchDetails (appid: number): Promise<steamGame> {
        const redisKey = `games:${appid}:details`;
        // Redis 캐싱을 먼저 확인
        const cacheData: string | null = await this.redisService.get(redisKey);
        if (cacheData) {
            return JSON.parse(cacheData);
        }
        const response = await this.axiosService.get(`https://store.steampowered.com/api/appdetails?appids=${appid}&l=koreana&cc=kr`);
        const { data } = response.data[appid];
        if (! data || response.data[appid]['success'] !== true) {
            throw new NotFoundException(`Appid ${appid} game not found.`);
        }
        // 야겜은 등록 불가능.
        if (Array.isArray(data.content_descriptors['ids'])) {
            for (let o of data.content_descriptors['ids']) {
                if ([3, 4].includes(o)) {
                    throw new BadRequestException(`Adult games cannot be registered. (${appid})`);
                }
            }
        }
        // (game, dlc) only!
        if (!['game', 'dlc'].includes(data.type)) {
            throw new BadRequestException(`Only game types on Steam can be registered. (${appid})`);
        }
        const result = { ...data, app_id: data.steam_appid, title: data.name, app_type: data.type, dlc: (!data?.dlc) ? [] : data.dlc};
        await this.redisService.set(redisKey, JSON.stringify(result), 86400);
        return result;
    }
}