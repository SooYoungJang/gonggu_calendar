import { Injectable } from '@nestjs/common';
import { ParsingStatus, Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { isGroupBuyCandidate } from './candidate-rules';
import { CollectRawPostDto } from './dto/collect-raw-post.dto';
import { ListRawPostsDto } from './dto/list-raw-posts.dto';
import { createContentHash } from './hash';

@Injectable()
export class RawPostsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListRawPostsDto) {
    const where: Prisma.RawPostWhereInput = {};

    if (query.parsingStatus) {
      where.parsingStatus = query.parsingStatus;
    }

    if (query.isCandidate !== undefined) {
      where.isCandidate = query.isCandidate === 'true';
    }

    return this.prisma.rawPost.findMany({
      where,
      include: { influencer: true, groupBuy: true },
      orderBy: { collectedAt: 'desc' },
      take: query.limit,
    });
  }

  async collect(dto: CollectRawPostDto) {
    const contentHash = createContentHash({
      instagramPostId: dto.instagramPostId,
      caption: dto.caption,
      postUrl: dto.postUrl,
    });
    const isCandidate = isGroupBuyCandidate(dto.caption);

    const influencer = await this.prisma.influencer.upsert({
      where: { instagramUsername: dto.influencerUsername },
      update: {},
      create: { instagramUsername: dto.influencerUsername },
    });

    const existing = await this.prisma.rawPost.findFirst({
      where: {
        OR: [{ instagramPostId: dto.instagramPostId }, { contentHash }],
      },
    });

    if (existing) {
      return { rawPost: existing, created: false, duplicate: true };
    }

    const rawPost = await this.prisma.rawPost.create({
      data: {
        instagramPostId: dto.instagramPostId,
        influencerId: influencer.id,
        caption: dto.caption,
        postUrl: dto.postUrl,
        imageUrl: dto.imageUrl,
        takenAt: new Date(dto.takenAt),
        collectedAt: new Date(dto.collectedAt),
        contentHash,
        isCandidate,
        parsingStatus: isCandidate ? ParsingStatus.PENDING : ParsingStatus.NEW,
      },
    });

    return { rawPost, created: true, duplicate: false };
  }
}
