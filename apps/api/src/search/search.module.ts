import { Module } from '@nestjs/common';

import { GroupBuysModule } from '../group-buys/group-buys.module';
import { SearchController } from './search.controller';

@Module({
  imports: [GroupBuysModule],
  controllers: [SearchController],
})
export class SearchModule {}
