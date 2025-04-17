import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { SteamModule } from './common/steam.module';
import { DealModule } from './common/deal.module';
import { PrismaModule } from "./prisma/prisma.module";
import { RedisModule } from "./common/redis.module";
import { AxiosModule } from "./common/axios.module";
import { GamesModule } from "./games/games.module";
import { GamePostModule } from './gamepost/gamePost.module';

@Module({
  imports: [SteamModule, DealModule, PrismaModule, RedisModule, AxiosModule, GamesModule, GamePostModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
