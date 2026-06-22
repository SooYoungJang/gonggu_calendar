import {
  Processor,
  WorkerHost,
  OnWorkerEvent,
} from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

import { OgParserService } from './og-parser.service';
import { PrismaService } from '../prisma/prisma.service';

export const OG_PARSE_QUEUE = 'feed-og-parsing';

export interface OgParseJobData {
  feedPostId: string;
  url: string;
}

@Processor(OG_PARSE_QUEUE)
export class CrawlingConsumer extends WorkerHost {
  private readonly logger = new Logger(CrawlingConsumer.name);

  constructor(
    private readonly ogParser: OgParserService,
    private readonly prisma: PrismaService,
  ) {
    super();
  }

  async process(job: Job<OgParseJobData>): Promise<void> {
    const { feedPostId, url } = job.data;

    this.logger.log(`Processing OG parse: feedPostId=${feedPostId}, url=${url}`);

    // 1. URL에서 OG 태그 파싱
    const result = await this.ogParser.parse(url);

    // 2. FeedPost 업데이트
    const updateData: Record<string, unknown> = {};

    if (result.success) {
      updateData.ogTitle = result.ogTags.title ?? null;
      updateData.ogDescription = result.ogTags.description ?? null;
      updateData.ogImage = result.ogTags.image ?? null;
      updateData.ogVideo = result.ogTags.video ?? null;
      updateData.ogUpdatedAt = new Date();

      this.logger.log(
        `OG parse success for ${url}: title="${result.ogTags.title?.slice(0, 50)}"`,
      );
    } else {
      // 실패 시 ogUpdatedAt만 기록하여 재시도 방지
      updateData.ogUpdatedAt = new Date();
      this.logger.warn(`OG parse failed for ${url}: ${result.error}`);
    }

    await this.prisma.feedPost.update({
      where: { id: feedPostId },
      data: updateData as any, // Prisma dynamic update
    });
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<OgParseJobData>) {
    this.logger.log(`OG parse completed: feedPostId=${job.data.feedPostId}`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<OgParseJobData> | undefined, error: Error) {
    if (job) {
      this.logger.error(
        `OG parse failed (job): feedPostId=${job.data.feedPostId}, error=${error.message}`,
      );
    } else {
      this.logger.error(`OG parse failed (unknown job): ${error.message}`);
    }
  }
}
