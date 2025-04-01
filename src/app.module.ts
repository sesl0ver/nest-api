import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { GamesModule } from './games/games.module';
import { SteamModule } from './steam/steam.module';

@Module({
  imports: [GamesModule, SteamModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
