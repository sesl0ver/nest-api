import {Injectable, NotFoundException} from '@nestjs/common';
import {RedisService} from "../common/redis.service";
import {AxiosService} from "../common/axios.service";
import { config } from "dotenv";
import {priceOverview} from "../steam/entities/steam.entity";

@Injectable()
export class DealService {
    constructor(private readonly redis: RedisService, private readonly AxiosService: AxiosService) {
        config();
    }

    async findDealID (appid: string): Promise<string | boolean> {
        const res = await this.AxiosService.get(`https://api.isthereanydeal.com/games/lookup/v1?key=${process.env.NEST_API_DEAL_KEY}&appid=${appid}`);
        if (! res || res?.data?.found !== true) {
            return false;
        }
        return res.data.game.id;
    }

    async getPriceOverView(appId: string): Promise<{ success: boolean, data?: priceOverview | null }> {
        const appKey = `steam:deal:${appId}`;
        let dealData = await this.redis.get(appKey);
        if (! dealData) {
            const dealId = await this.findDealID(appId);
            if (! dealId) {
                return {
                    success: false
                };
            }
            const dealRes = await this.AxiosService.post(`https://api.isthereanydeal.com/games/overview/v2?key=${process.env.NEST_API_DEAL_KEY}&country=KR&shops=61`,[dealId]);
            dealData = dealRes.data;
            if (! dealData) {
                return {
                    success: false
                };
            }
            await this.redis.set(appKey, JSON.stringify(dealRes.data), 3600); // 한시간마다 갱신
        } else {
            dealData = JSON.parse(dealData);
            if (! dealData) {
                return {
                    success: false
                };
            }
        }
        if (dealData['prices'].length < 1) {
            return {
                success: false
            }
        }
        const price = dealData['prices'][0];
        return {
            success: true,
            data: (! price) ? null : {
                id: price?.['id'] ?? "",
                lowPrice: price?.['lowest']['price']['amountInt'] ?? 0,
                lowCut: price?.['lowest']['cut'] ?? 0,
                currentPrice: price?.['current']['price']['amountInt'] ?? 0,
                regularPrice: price?.['current']['regular']['amountInt'] ?? 0,
                cut: price?.['current']['cut'] ?? 0
            }
        };
    }
}
