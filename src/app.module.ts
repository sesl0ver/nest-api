import { Module } from '@nestjs/common';
import { MoviesModule } from './movies/movies.module';
import { AppController } from './app.controller';
import { GamesModule } from './games/games.module';

@Module({
  imports: [MoviesModule, GamesModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
