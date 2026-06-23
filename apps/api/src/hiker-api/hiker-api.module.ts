import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HikerApiController } from './hiker-api.controller';
import { HikerApiService } from './hiker-api.service';

@Module({
  imports: [ConfigModule],
  controllers: [HikerApiController],
  providers: [HikerApiService],
  exports: [HikerApiService],
})
export class HikerApiModule {}
