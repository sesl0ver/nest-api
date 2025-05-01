import {Module} from '@nestjs/common';
import {AuthController} from "./auth.controller";
import {AuthService} from "./auth.service";
import {SteamStrategy} from "./steam.strategy";
import {AccountModule} from "../account/account.module";
import {JwtModule} from '@nestjs/jwt';
import {ConfigService} from '@nestjs/config';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('NEST_API_JWT_SECRET_KEY'), // 환경변수에서 JWT_SECRET_KEY 값을 가져오기
        signOptions: { expiresIn: '1h' }, // 기본 만료 시간 1시간 설정
      }),
      inject: [ConfigService], // ConfigService를 주입
    }), AccountModule],
  controllers: [AuthController],
  providers: [AuthService, SteamStrategy],
})
export class AuthModule {}