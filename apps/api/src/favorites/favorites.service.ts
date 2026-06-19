import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateFavoriteDto) {
    return this.prisma.favorite.upsert({
      where: {
        userId_groupBuyId: {
          userId: dto.userId,
          groupBuyId: dto.groupBuyId,
        },
      },
      update: {},
      create: dto,
    });
  }

  delete(id: string) {
    return this.prisma.favorite.delete({ where: { id } });
  }
}
