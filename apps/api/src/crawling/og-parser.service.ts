import { Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';

export interface OgTags {
  title?: string;
  description?: string;
  image?: string;
  video?: string;
  url?: string;
  siteName?: string;
  type?: string;
}

export interface OgParseResult {
  success: boolean;
  ogTags: OgTags;
  error?: string;
}

@Injectable()
export class OgParserService {
  private readonly logger = new Logger(OgParserService.name);

  /**
   * 지정된 URL에서 OG 태그를 추출합니다.
   * 내부적으로 fetch를 사용하며 5초 타임아웃이 적용됩니다.
   */
  async parse(url: string): Promise<OgParseResult> {
    const result: OgParseResult = {
      success: false,
      ogTags: {},
    };

    try {
      // URL 유효성 검사
      const parsedUrl = this.validateUrl(url);
      if (!parsedUrl) {
        result.error = `Invalid URL: ${url}`;
        return result;
      }

      // HTML fetch (5초 타임아웃)
      const html = await this.fetchHtml(url);
      if (!html) {
        result.error = `Failed to fetch HTML from ${url}`;
        return result;
      }

      // cheerio로 OG 태그 파싱
      result.ogTags = this.extractOgTags(html, url);
      result.success = true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      this.logger.warn(`OG parse failed for ${url}: ${message}`);
      result.error = message;
    }

    return result;
  }

  private validateUrl(url: string): URL | null {
    try {
      const parsed = new URL(url);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }

  private async fetchHtml(url: string): Promise<string | null> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (compatible; GongGuBot/1.0; +https://gonggu.app)',
          Accept: 'text/html,application/xhtml+xml',
        },
        redirect: 'follow',
      });

      if (!response.ok) {
        this.logger.warn(`HTTP ${response.status} for ${url}`);
        return null;
      }

      const contentType = response.headers.get('content-type') ?? '';
      if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
        this.logger.warn(`Non-HTML content type for ${url}: ${contentType}`);
        return null;
      }

      return await response.text();
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        this.logger.warn(`Request timeout for ${url}`);
        return null;
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  }

  private extractOgTags(html: string, fallbackUrl: string): OgTags {
    const $ = cheerio.load(html);
    const og: OgTags = {};

    // 메타 태그 추출 헬퍼
    const getMeta = (property: string): string | undefined => {
      return (
        $(`meta[property="${property}"]`).attr('content') ??
        $(`meta[name="${property}"]`).attr('content') ??
        $(`meta[property="og:${property}"]`).attr('content') ??
        undefined
      );
    };

    const getNameAttr = (name: string): string | undefined => {
      return $(`meta[name="${name}"]`).attr('content') ?? undefined;
    };

    // OG: 기본
    og.title = getMeta('og:title') || $('title').text().trim() || undefined;
    og.description =
      getMeta('og:description') ||
      getNameAttr('description') ||
      undefined;
    og.image = getMeta('og:image') || undefined;
    og.video = getMeta('og:video') || getMeta('og:video:url') || undefined;
    og.url = getMeta('og:url') || fallbackUrl;
    og.siteName = getMeta('og:site_name') || undefined;
    og.type = getMeta('og:type') || undefined;

    // image fallback: og:image:secure_url
    if (!og.image) {
      og.image = getMeta('og:image:secure_url') || undefined;
    }

    // 이미지 URL 정규화
    if (og.image && !og.image.startsWith('http')) {
      try {
        const base = new URL(og.url || fallbackUrl);
        og.image = new URL(og.image, base.origin).href;
      } catch {
        // 정규화 실패 시 원본 유지
      }
    }

    // video URL 정규화
    if (og.video && !og.video.startsWith('http')) {
      try {
        const base = new URL(og.url || fallbackUrl);
        og.video = new URL(og.video, base.origin).href;
      } catch {
        // 정규화 실패 시 원본 유지
      }
    }

    return og;
  }
}
