import { ConflictException, Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateInfluencerDto } from './dto/create-influencer.dto';

@Injectable()
export class InfluencersService {
  constructor(private readonly prisma: PrismaService) {}

  listActive() {
    return this.prisma.influencer.findMany({
      where: { isActive: true },
      orderBy: { instagramUsername: 'asc' },
    });
  }

  listAll() {
    return this.prisma.influencer.findMany({
      orderBy: [{ isActive: 'desc' }, { instagramUsername: 'asc' }],
    });
  }

  async create(dto: CreateInfluencerDto) {
    const instagramUsername = dto.instagramUsername.trim().replace(/^@/, '');
    const existing = await this.prisma.influencer.findUnique({
      where: { instagramUsername },
    });

    if (existing?.isActive) {
      throw new ConflictException('이미 등록된 인스타 계정입니다.');
    }

    if (existing) {
      return this.prisma.influencer.update({
        where: { id: existing.id },
        data: {
          displayName: dto.displayName,
          profileImageUrl: dto.profileImageUrl,
          isActive: true,
        },
      });
    }

    return this.prisma.influencer.create({
      data: {
        instagramUsername,
        displayName: dto.displayName,
        profileImageUrl: dto.profileImageUrl,
      },
    });
  }

  async deactivate(id: string) {
    return this.prisma.influencer.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
