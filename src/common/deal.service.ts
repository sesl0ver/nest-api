import {Injectable, NotFoundException} from '@nestjs/common';
import {RedisService} from "./redis.service";
import {AxiosService} from "./axios.service";
import { config } from "dotenv";
import {Price} from "../entities/game.entity";

@Injectable()
export class DealService {
    private apiUrl = "https://api.isthereanydeal.com/";
    constructor(private readonly redis: RedisService, private readonly AxiosService: AxiosService) {
        config();
    }

    async fetchDealID (appid: string): Promise<string | boolean> {
        const res = await this.AxiosService.get(`${this.apiUrl}/games/lookup/v1?key=${process.env.NEST_API_DEAL_KEY}&appid=${appid}`);
        if (! res || res?.data?.found !== true) {
            return false;
        }
        return res.data.game.id;
    }

    async fetchPriceOverview(appId: string): Promise<Price> {
        const appKey = `steam:deal:${appId}`;
        let dealData = await this.redis.get(appKey);
        if (! dealData) {
            const dealId = await this.fetchDealID(appId);
            if (! dealId) {
                return {};
            }
            const dealRes = await this.AxiosService.post(`${this.apiUrl}/games/overview/v2?key=${process.env.NEST_API_DEAL_KEY}&country=KR&shops=61`,[dealId]);
            if (! dealRes?.data) {
                return {};
            }
            dealData = dealRes.data['prices'];
            await this.redis.set(appKey, JSON.stringify(dealData), 43200); // 12시간 마다 갱신
        } else {
            dealData = JSON.parse(dealData);
            if (! dealData) {
                return {};
            }
        }
        if (!dealData || dealData?.length < 1) {
            return {}
        }
        const price = dealData[0];
        return {
            id: price?.['id'] ?? "",
            lowPrice: price?.['lowest']['price']['amountInt'] ?? 0,
            lowCut: price?.['lowest']['cut'] ?? 0,
            currentPrice: price?.['current']['price']['amountInt'] ?? 0,
            regularPrice: price?.['current']['regular']['amountInt'] ?? 0,
            cut: price?.['current']['cut'] ?? 0,
        };
    }
}
