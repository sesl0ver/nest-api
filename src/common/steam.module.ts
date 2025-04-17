import {Module} from '@nestjs/common';
import {SteamService} from './steam.service';

@Module({
    imports: [],
    controllers: [],
    providers: [SteamService],
})
export class SteamModule {}
