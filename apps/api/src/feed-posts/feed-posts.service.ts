import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { CreateFeedPostDto } from './dto/create-feed-post.dto';
import { ListFeedPostsDto } from './dto/list-feed-posts.dto';
import { UpdateFeedPostDto } from './dto/update-feed-post.dto';

@Injectable()
export class FeedPostsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListFeedPostsDto) {
    const where: Prisma.FeedPostWhereInput = {};

    if (!query.includeInactive) {
      where.isActive = true;
    }

    const skip = (query.page - 1) * query.limit;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.feedPost.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        skip,
        take: query.limit,
      }),
      this.prisma.feedPost.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async get(id: string) {
    const feedPost = await this.prisma.feedPost.findUnique({ where: { id } });

    if (!feedPost) {
      throw new NotFoundException('Feed post not found');
    }

    return feedPost;
  }

  async create(dto: CreateFeedPostDto) {
    const data: Prisma.FeedPostCreateInput = {
      instagramUrl: dto.instagramUrl,
    };

    if (dto.linkUrl) data.linkUrl = dto.linkUrl;
    if (dto.openDate) data.openDate = new Date(dto.openDate);
    if (dto.closeDate) data.closeDate = new Date(dto.closeDate);
    if (dto.caption) data.caption = dto.caption;

    return this.prisma.feedPost.create({ data });
  }

  async update(id: string, dto: UpdateFeedPostDto) {
    const existing = await this.prisma.feedPost.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException('Feed post not found');
    }

    const data: Prisma.FeedPostUpdateInput = {};

    if (dto.instagramUrl !== undefined) data.instagramUrl = dto.instagramUrl;
    if (dto.linkUrl !== undefined) data.linkUrl = dto.linkUrl;
    if (dto.openDate !== undefined) data.openDate = new Date(dto.openDate);
    if (dto.closeDate !== undefined) data.closeDate = new Date(dto.closeDate);
    if (dto.caption !== undefined) data.caption = dto.caption;
    if (dto.thumbnailUrl !== undefined) data.thumbnailUrl = dto.thumbnailUrl;
    if (dto.mediaUrl !== undefined) data.mediaUrl = dto.mediaUrl;
    if (dto.accountName !== undefined) data.accountName = dto.accountName;
    if (dto.sortOrder !== undefined) data.sortOrder = dto.sortOrder;

    return this.prisma.feedPost.update({ where: { id }, data });
  }

  async remove(id: string) {
    const existing = await this.prisma.feedPost.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException('Feed post not found');
    }

    // Soft delete: set isActive to false
    return this.prisma.feedPost.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
