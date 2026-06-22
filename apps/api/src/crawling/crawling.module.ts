import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

import { OgParserService } from './og-parser.service';
import { CrawlingConsumer, OG_PARSE_QUEUE } from './crawling.consumer';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: OG_PARSE_QUEUE }),
    PrismaModule,
  ],
  providers: [OgParserService, CrawlingConsumer],
  exports: [OgParserService, BullModule],
})
export class CrawlingModule {}
