import {Controller, Get, Param} from '@nestjs/common';
import {DealService} from "./deal.service";
import {steamGame} from "../steam/entities/steam.entity";

@Controller('deal')
export class DealController {
    constructor(private readonly DealService: DealService) {
    }

    @Get(':id')
    async getSteamGames(@Param('id') id: string): Promise<any> {
        return this.DealService.getPriceOverView(id);
    }

}
