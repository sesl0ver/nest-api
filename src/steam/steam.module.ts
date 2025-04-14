import {Module} from '@nestjs/common';
import {SteamService} from './steam.service';
import {SteamController} from "./steam.controller";

@Module({
    imports: [],
    controllers: [SteamController],
    providers: [SteamService],
})
export class SteamModule {}
