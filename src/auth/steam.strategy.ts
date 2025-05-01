import {PassportStrategy} from '@nestjs/passport';
import {Injectable} from '@nestjs/common';
import {Strategy} from 'passport-steam';
import {ConfigService} from '@nestjs/config';
import {AccountService} from "../account/account.service";
import {Account} from "../types/Account";

@Injectable()
export class SteamStrategy extends PassportStrategy(Strategy, 'steam') {
    constructor(private readonly configService: ConfigService, private readonly accountService: AccountService) {
        super({
            returnURL: 'http://localhost:3333/auth/steam/return',
            realm: 'http://localhost:3333/',
            apiKey: configService.get<string>('NEST_API_STEAM_KEY', ''),
        });
    }

    async validate(identifier: string, profile: any, done: Function) {
        const steam_id = profile.id;
        const username = profile.displayName;
        const avatar = profile.photos?.[0]?.value;

        // 1. 유저가 이미 존재하는지 확인
        let user: Account | null = await this.accountService.findBySteamId(steam_id);

        // 2. 계정이 없으니 계정 생성.

        if (! user) {
            user = await this.accountService.createSteamAccount({steam_id, username, avatar});
        }


        // 3. 로그인 처리 (Passport에 넘겨줌)
        return done(null, user);
    }
}