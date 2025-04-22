import { Module } from '@nestjs/common';
import { GamePostService } from './gamePost.service';

@Module({
  providers: [GamePostService]
})
export class GamePostModule {}
