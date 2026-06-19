import { ConflictException } from '@nestjs/common';

import { InfluencersService } from './influencers.service';

type PrismaMock = {
  influencer: {
    findMany: jest.Mock;
    findUnique: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
  };
};

describe('InfluencersService', () => {
  function createPrismaMock(): PrismaMock {
    return {
      influencer: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };
  }

  let prisma: PrismaMock;
  let service: InfluencersService;

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new InfluencersService(prisma as never);
  });

  describe('listActive', () => {
    it('returns only active influencers ordered by username', async () => {
      const mockInfluencers = [
        { id: 'inf-1', instagramUsername: 'aaa', isActive: true },
        { id: 'inf-2', instagramUsername: 'bbb', isActive: true },
      ];
      prisma.influencer.findMany.mockResolvedValue(mockInfluencers);

      const result = await service.listActive();

      expect(prisma.influencer.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { instagramUsername: 'asc' },
      });
      expect(result).toEqual(mockInfluencers);
    });

    it('returns empty array when no active influencers', async () => {
      prisma.influencer.findMany.mockResolvedValue([]);

      const result = await service.listActive();

      expect(result).toEqual([]);
    });
  });

  describe('listAll', () => {
    it('returns all influencers ordered by active status then username', async () => {
      const mockInfluencers = [
        { id: 'inf-1', instagramUsername: 'active', isActive: true },
        { id: 'inf-2', instagramUsername: 'inactive', isActive: false },
      ];
      prisma.influencer.findMany.mockResolvedValue(mockInfluencers);

      const result = await service.listAll();

      expect(prisma.influencer.findMany).toHaveBeenCalledWith({
        orderBy: [{ isActive: 'desc' }, { instagramUsername: 'asc' }],
      });
      expect(result).toEqual(mockInfluencers);
    });

    it('returns empty array when no influencers', async () => {
      prisma.influencer.findMany.mockResolvedValue([]);

      const result = await service.listAll();

      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('blocks duplicate active instagram handles', async () => {
      prisma.influencer.findUnique.mockResolvedValueOnce({ id: 'inf-1', isActive: true });

      await expect(
        service.create({ instagramUsername: 'sample', displayName: 'Sample' }),
      ).rejects.toBeInstanceOf(ConflictException);

      expect(prisma.influencer.create).not.toHaveBeenCalled();
      expect(prisma.influencer.update).not.toHaveBeenCalled();
    });

    it('reactivates an inactive instagram handle instead of creating a duplicate', async () => {
      prisma.influencer.findUnique.mockResolvedValueOnce({ id: 'inf-1', isActive: false });
      prisma.influencer.update.mockResolvedValueOnce({ id: 'inf-1', isActive: true });

      await service.create({ instagramUsername: 'sample', displayName: 'Sample' });

      expect(prisma.influencer.update).toHaveBeenCalledWith({
        where: { id: 'inf-1' },
        data: {
          displayName: 'Sample',
          profileImageUrl: undefined,
          isActive: true,
        },
      });
      expect(prisma.influencer.create).not.toHaveBeenCalled();
    });

    it('creates new influencer when username not exists', async () => {
      prisma.influencer.findUnique.mockResolvedValueOnce(null);
      const newInfluencer = { id: 'inf-new', instagramUsername: 'newuser', displayName: 'New User', isActive: true };
      prisma.influencer.create.mockResolvedValueOnce(newInfluencer);

      const result = await service.create({ instagramUsername: 'newuser', displayName: 'New User' });

      expect(prisma.influencer.create).toHaveBeenCalledWith({
        data: {
          instagramUsername: 'newuser',
          displayName: 'New User',
          profileImageUrl: undefined,
        },
      });
      expect(result).toEqual(newInfluencer);
    });

    it('creates new influencer with profileImageUrl', async () => {
      prisma.influencer.findUnique.mockResolvedValueOnce(null);
      const newInfluencer = { id: 'inf-new', instagramUsername: 'newuser', displayName: 'New User', profileImageUrl: 'https://example.com/img.jpg', isActive: true };
      prisma.influencer.create.mockResolvedValueOnce(newInfluencer);

      const result = await service.create({ instagramUsername: 'newuser', displayName: 'New User', profileImageUrl: 'https://example.com/img.jpg' });

      expect(prisma.influencer.create).toHaveBeenCalledWith({
        data: {
          instagramUsername: 'newuser',
          displayName: 'New User',
          profileImageUrl: 'https://example.com/img.jpg',
        },
      });
      expect(result.profileImageUrl).toBe('https://example.com/img.jpg');
    });

    it('trims and removes @ from instagramUsername', async () => {
      prisma.influencer.findUnique.mockResolvedValueOnce(null);
      prisma.influencer.create.mockResolvedValueOnce({ id: 'inf-new', instagramUsername: 'trimmed', isActive: true });

      await service.create({ instagramUsername: '  @trimmed  ', displayName: 'Test' });

      expect(prisma.influencer.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ instagramUsername: 'trimmed' }),
        })
      );
    });
  });

  describe('deactivate', () => {
    it('deactivates influencer by id', async () => {
      const deactivated = { id: 'inf-1', isActive: false };
      prisma.influencer.update.mockResolvedValueOnce(deactivated);

      const result = await service.deactivate('inf-1');

      expect(prisma.influencer.update).toHaveBeenCalledWith({
        where: { id: 'inf-1' },
        data: { isActive: false },
      });
      expect(result).toEqual(deactivated);
    });

    it('throws when influencer not found (Prisma throws)', async () => {
      prisma.influencer.update.mockRejectedValueOnce(new Error('Not found'));

      await expect(service.deactivate('non-existent')).rejects.toThrow();
    });
  });
});