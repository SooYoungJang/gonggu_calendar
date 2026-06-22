import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';

import { FeedPostsController } from './feed-posts.controller';
import { FeedPostsService } from './feed-posts.service';

export const FEED_OG_QUEUE = 'feed-og-parsing';

@Module({
  imports: [
    BullModule.registerQueue({ name: FEED_OG_QUEUE }),
  ],
  controllers: [FeedPostsController],
  providers: [FeedPostsService],
  exports: [FeedPostsService, BullModule],
})
export class FeedPostsModule {}
