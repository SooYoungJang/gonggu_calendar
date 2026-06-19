import { GroupBuyStatus, ParsingStatus } from '@prisma/client';

import { AdminService } from './admin.service';

type PrismaMock = {
  groupBuy: { findMany: jest.Mock; update: jest.Mock };
  influencer: { upsert: jest.Mock };
  rawPost: { create: jest.Mock };
};

describe('AdminService', () => {
  function createPrismaMock(): PrismaMock {
    return {
      groupBuy: {
        findMany: jest.fn(),
        update: jest.fn(),
      },
      influencer: {
        upsert: jest.fn(),
      },
      rawPost: {
        create: jest.fn(),
      },
    };
  }

  let prisma: PrismaMock;
  let service: AdminService;

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new AdminService(prisma as never);
  });

  it('lists review submissions with influencer and raw post context', async () => {
    prisma.groupBuy.findMany.mockResolvedValueOnce([{ id: 'gb-1' }]);

    await expect(service.listSubmissions({ status: GroupBuyStatus.REVIEW_REQUIRED, limit: 50 })).resolves.toEqual([
      { id: 'gb-1' },
    ]);

    expect(prisma.groupBuy.findMany).toHaveBeenCalledWith({
      where: { status: GroupBuyStatus.REVIEW_REQUIRED },
      include: { rawPost: { include: { influencer: true } } },
      orderBy: [{ createdAt: 'desc' }],
      take: 50,
    });
  });

  it('updates editable submission fields before moderation', async () => {
    prisma.groupBuy.update.mockResolvedValueOnce({ id: 'gb-1' });

    await service.updateSubmission('gb-1', {
      productName: '수정된 공구명',
      brandName: 'Updated Brand',
      startDate: '2026-06-20T00:00:00.000Z',
      endDate: '2026-06-30T14:59:59.000Z',
      purchaseUrl: 'https://example.com/updated',
      discountInfo: '30% 할인',
      summary: '운영자 수정 요약',
    });

    expect(prisma.groupBuy.update).toHaveBeenCalledWith({
      where: { id: 'gb-1' },
      data: {
        productName: '수정된 공구명',
        brandName: 'Updated Brand',
        startDate: new Date('2026-06-20T00:00:00.000Z'),
        endDate: new Date('2026-06-30T14:59:59.000Z'),
        purchaseUrl: 'https://example.com/updated',
        discountInfo: '30% 할인',
        summary: '운영자 수정 요약',
      },
      include: { rawPost: { include: { influencer: true } } },
    });
  });

  it('creates a manual submission as review-required group buy backed by a raw post', async () => {
    prisma.influencer.upsert.mockResolvedValueOnce({ id: 'inf-1' });
    prisma.rawPost.create.mockResolvedValueOnce({ id: 'raw-1' });

    await service.createSubmission({
      influencerUsername: 'beauty_admin',
      caption: '오늘 공구 오픈합니다',
      postUrl: 'https://www.instagram.com/p/manual',
      productName: '비건 선크림',
      brandName: 'Clean Beauty',
      endDate: '2026-06-30T14:59:59.000Z',
      purchaseUrl: 'https://example.com/buy',
      discountInfo: '20% 할인',
      summary: '운영자가 수동 등록한 공구',
    });

    expect(prisma.rawPost.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          influencerId: 'inf-1',
          caption: '오늘 공구 오픈합니다',
          postUrl: 'https://www.instagram.com/p/manual',
          isCandidate: true,
          parsingStatus: ParsingStatus.PARSED,
          groupBuy: {
            create: expect.objectContaining({
              productName: '비건 선크림',
              brandName: 'Clean Beauty',
              endDate: new Date('2026-06-30T14:59:59.000Z'),
              purchaseUrl: 'https://example.com/buy',
              discountInfo: '20% 할인',
              summary: '운영자가 수동 등록한 공구',
              confidence: 1,
              status: GroupBuyStatus.REVIEW_REQUIRED,
            }),
          },
        }),
      }),
    );
  });
});
