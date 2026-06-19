import { Module } from '@nestjs/common';

import { GroupBuysController } from './group-buys.controller';
import { GroupBuysService } from './group-buys.service';

@Module({
  controllers: [GroupBuysController],
  providers: [GroupBuysService],
  exports: [GroupBuysService],
})
export class GroupBuysModule {}
