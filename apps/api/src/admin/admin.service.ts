import { Injectable } from '@nestjs/common';
import { GroupBuyStatus, ParsingStatus } from '@prisma/client';

import { createContentHash } from '../raw-posts/hash';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { ListSubmissionsDto } from './dto/list-submissions.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  listSubmissions(query: ListSubmissionsDto) {
    return this.prisma.groupBuy.findMany({
      where: { status: query.status ?? GroupBuyStatus.REVIEW_REQUIRED },
      include: { rawPost: { include: { influencer: true } } },
      orderBy: [{ createdAt: 'desc' }],
      take: query.limit ?? 50,
    });
  }

  async updateSubmission(id: string, dto: UpdateSubmissionDto) {
    return this.prisma.groupBuy.update({
      where: { id },
      data: {
        productName: dto.productName,
        brandName: dto.brandName,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        purchaseUrl: dto.purchaseUrl,
        discountInfo: dto.discountInfo,
        summary: dto.summary,
      },
      include: { rawPost: { include: { influencer: true } } },
    });
  }

  async createSubmission(dto: CreateSubmissionDto) {
    const now = new Date();
    const instagramPostId = this.createManualPostId(dto.postUrl);
    const contentHash = createContentHash({
      instagramPostId,
      caption: dto.caption,
      postUrl: dto.postUrl,
    });

    const influencer = await this.prisma.influencer.upsert({
      where: { instagramUsername: dto.influencerUsername },
      update: {
        displayName: dto.influencerDisplayName,
        isActive: true,
      },
      create: {
        instagramUsername: dto.influencerUsername,
        displayName: dto.influencerDisplayName,
      },
    });

    return this.prisma.rawPost.create({
      data: {
        instagramPostId,
        influencerId: influencer.id,
        caption: dto.caption,
        postUrl: dto.postUrl,
        imageUrl: dto.imageUrl,
        takenAt: now,
        collectedAt: now,
        contentHash,
        isCandidate: true,
        parsingStatus: ParsingStatus.PARSED,
        groupBuy: {
          create: {
            productName: dto.productName,
            brandName: dto.brandName,
            startDate: dto.startDate ? new Date(dto.startDate) : null,
            endDate: dto.endDate ? new Date(dto.endDate) : null,
            purchaseUrl: dto.purchaseUrl,
            discountInfo: dto.discountInfo,
            summary: dto.summary,
            confidence: 1,
            status: GroupBuyStatus.REVIEW_REQUIRED,
          },
        },
      },
      include: { influencer: true, groupBuy: true },
    });
  }

  private createManualPostId(postUrl: string) {
    const normalizedUrl = postUrl.replace(/\/$/, '');
    const slug = normalizedUrl.split('/').pop() || normalizedUrl;
    return `manual:${slug}`;
  }
}
