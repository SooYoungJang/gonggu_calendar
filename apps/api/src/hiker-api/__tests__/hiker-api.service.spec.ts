import 'reflect-metadata';
import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals';
import { ConfigService } from '@nestjs/config';
import { HikerApiService } from '../hiker-api.service';
import { HttpException } from '@nestjs/common';

describe('HikerApiService', () => {
  function createConfig(key?: string, mock?: string) {
    return {
      get: jest.fn((k: string) => {
        if (k === 'HIKER_API_KEY') return key ?? undefined;
        if (k === 'HIKER_MOCK') return mock ?? undefined;
        return undefined;
      }),
    } as unknown as ConfigService;
  }

  describe('mock mode detection', () => {
    it('mock mode when HIKER_API_KEY is missing', () => {
      const svc = new HikerApiService(createConfig());
      expect((svc as any).isMock).toBe(true);
    });

    it('mock mode when HIKER_MOCK=true even with key', () => {
      const svc = new HikerApiService(createConfig('real-key', 'true'));
      expect((svc as any).isMock).toBe(true);
    });

    it('live mode when HIKER_API_KEY is set and HIKER_MOCK is absent', () => {
      const svc = new HikerApiService(createConfig('real-key'));
      expect((svc as any).isMock).toBe(false);
    });
  });

  describe('lookup() — mock mode', () => {
    let svc: HikerApiService;

    beforeEach(() => {
      svc = new HikerApiService(createConfig());
    });

    it('returns mock data for a valid Instagram URL', async () => {
      const result = await svc.lookup({ url: 'https://instagram.com/p/ABC123/' });

      expect(result.media_id).toMatch(/^mock_/);
      expect(result.image_url).toContain('picsum.photos');
      expect(result.caption).toContain('Mock Instagram post');
      expect(result.like_count).toBeGreaterThanOrEqual(100);
      expect(result.comment_count).toBeGreaterThanOrEqual(10);
      expect(result.username).toMatch(/^mock_user_/);
      expect(result.taken_at).toBeGreaterThan(0);
      expect(result.media_type).toBe(1);
    });

    it('returns deterministic data for the same URL', async () => {
      const r1 = await svc.lookup({ url: 'https://instagram.com/p/ABC/' });
      const r2 = await svc.lookup({ url: 'https://instagram.com/p/ABC/' });
      expect(r1.media_id).toBe(r2.media_id);
      expect(r1.like_count).toBe(r2.like_count);
      expect(r1.username).toBe(r2.username);
    });

    it('returns different data for different URLs', async () => {
      const r1 = await svc.lookup({ url: 'https://instagram.com/p/AAA/' });
      const r2 = await svc.lookup({ url: 'https://instagram.com/p/BBB/' });
      expect(r1.media_id).not.toBe(r2.media_id);
    });

    it('rejects empty url', async () => {
      await expect(svc.lookup({ url: '' })).rejects.toThrow(HttpException);
      await expect(svc.lookup({ url: '   ' })).rejects.toThrow(HttpException);
    });

    it('rejects null/undefined url', async () => {
      await expect(svc.lookup({ url: null as any })).rejects.toThrow(HttpException);
      await expect(svc.lookup({ url: undefined as any })).rejects.toThrow(HttpException);
    });

    it('supports lookupByUrl convenience method', async () => {
      const result = await svc.lookupByUrl('https://instagram.com/p/XYZ/');
      expect(result.media_id).toMatch(/^mock_/);
    });
  });

  describe('lookup() — live mode (mock fetch)', () => {
    let svc: HikerApiService;
    const originalFetch = globalThis.fetch;

    afterEach(() => {
      globalThis.fetch = originalFetch;
    });

    it('maps a successful HikerAPI response correctly', async () => {
      // @ts-expect-error - jest mock assignment
      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          id: '123456789',
          pk: '123456789',
          image_versions2: {
            candidates: [
              { url: 'https://cdn.example.com/small.jpg', width: 320, height: 320 },
              { url: 'https://cdn.example.com/large.jpg', width: 1080, height: 1080 },
            ],
          },
          like_count: 2345,
          comment_count: 89,
          caption: { text: 'Amazing photo!' },
          user: { username: 'travel_blogger' },
          taken_at: 1700000000,
          media_type: 1,
        }),
      });

      svc = new HikerApiService(createConfig('real-key'));

      const result = await svc.lookup({ url: 'https://instagram.com/p/REAL/' });

      expect(result.media_id).toBe('123456789');
      expect(result.image_url).toBe('https://cdn.example.com/large.jpg');
      expect(result.caption).toBe('Amazing photo!');
      expect(result.like_count).toBe(2345);
      expect(result.comment_count).toBe(89);
      expect(result.username).toBe('travel_blogger');
      expect(result.taken_at).toBe(1700000000);
      expect(result.media_type).toBe(1);
    });

    it('handles missing optional fields gracefully', async () => {
      // @ts-expect-error - jest mock assignment
      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          pk: '999',
          like_count: 100,
          comment_count: 5,
          media_type: 2,
        }),
      });

      svc = new HikerApiService(createConfig('real-key'));

      const result = await svc.lookup({ url: 'https://instagram.com/p/MINIMAL/' });

      expect(result.media_id).toBe('999');
      expect(result.image_url).toBe('');
      expect(result.caption).toBeNull();
      expect(result.username).toBe('');
      expect(result.media_type).toBe(2);
    });

    it('throws on HTTP error from HikerAPI', async () => {
      // @ts-expect-error - jest mock assignment
      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 400,
        text: async () => 'Bad Request',
      });

      svc = new HikerApiService(createConfig('real-key'));

      await expect(
        svc.lookup({ url: 'https://instagram.com/p/BAD/' }),
      ).rejects.toThrow('HikerAPI returned 400');
    });

    it('throws on network failure', async () => {
      // @ts-expect-error - jest mock assignment
      globalThis.fetch = jest.fn().mockRejectedValue(new Error('ECONNREFUSED'));

      svc = new HikerApiService(createConfig('real-key'));

      await expect(
        svc.lookup({ url: 'https://instagram.com/p/NET/' }),
      ).rejects.toThrow(/HikerAPI request failed/);
    });

    it('throws on invalid JSON response', async () => {
      // @ts-expect-error - jest mock assignment
      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => { throw new Error('Invalid JSON'); },
      });

      svc = new HikerApiService(createConfig('real-key'));

      await expect(
        svc.lookup({ url: 'https://instagram.com/p/INVALIDJSON/' }),
      ).rejects.toThrow(/Invalid JSON from HikerAPI/);
    });

    it('sets x-access-key header on requests', async () => {
      let capturedHeaders: Record<string, string> = {};
      // @ts-expect-error - jest mock assignment
      globalThis.fetch = jest.fn().mockImplementation((_url: string, opts: any) => {
        capturedHeaders = opts?.headers ?? {};
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ pk: '1', like_count: 0, comment_count: 0, media_type: 1 }),
        });
      });

      svc = new HikerApiService(createConfig('my-secret-key'));

      await svc.lookup({ url: 'https://instagram.com/p/HEADER/' });

      expect(capturedHeaders['x-access-key']).toBe('my-secret-key');
    });

    it('encodes URL parameter', async () => {
      let capturedUrl = '';
      // @ts-expect-error - jest mock assignment
      globalThis.fetch = jest.fn().mockImplementation((url: string) => {
        capturedUrl = url;
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ pk: '1', like_count: 0, comment_count: 0, media_type: 1 }),
        });
      });

      svc = new HikerApiService(createConfig('key'));

      await svc.lookup({ url: 'https://instagram.com/p/테스트/' });

      expect(capturedUrl).toContain(encodeURIComponent('https://instagram.com/p/테스트/'));
    });
  });
});
