import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { SteamModule } from './steam/steam.module';
import { DealModule } from './deal/deal.module';
import { PrismaModule } from "./prisma/prisma.module";
import { RedisModule } from "./common/redis.module";
import { AxiosModule } from "./common/axios.module";

@Module({
  imports: [SteamModule, DealModule, PrismaModule, RedisModule, AxiosModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
