import { Module } from '@nestjs/common';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { AppController } from './app.controller';
import { SteamModule } from './common/steam.module';
import { DealModule } from './common/deal.module';
import { PrismaModule } from "./prisma/prisma.module";
import { RedisModule } from "./common/redis.module";
import { AxiosModule } from "./common/axios.module";
import { GamesModule } from "./games/games.module";
import { GamePostModule } from './games/gamePost.module';
import { ImageModule } from './image/image.module';
import {FileModule} from "./common/fileClieanup.module";

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public/uploads'), // 업로드된 파일들이 있는 폴더
      serveRoot: '/f', // 클라이언트가 접근할 경로
      setHeaders: (res: { setHeader: (arg0: string, arg1: string) => void; }, path: any, stat: any) => {
        res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1년 캐시
      },
    } as any),
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
      isGlobal: true,
    }),
    ScheduleModule.forRoot(), FileModule,
    SteamModule, DealModule, PrismaModule, RedisModule, AxiosModule, GamesModule, GamePostModule, ImageModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
