import {Module} from '@nestjs/common';
import {GamesService} from './games.service';
import {GamesController} from './games.controller';
import {SteamService} from "../common/steam.service";
import {DealService} from "../common/deal.service";
import {GamePostService} from "./gamePost.service";

@Module({
  imports: [],
  controllers: [GamesController],
  providers: [GamesService, SteamService, DealService, GamePostService],
})
export class GamesModule {}
