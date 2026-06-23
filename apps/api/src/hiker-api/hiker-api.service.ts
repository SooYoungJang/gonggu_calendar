import {
  Injectable,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  HikerApiLookupDto,
  HikerApiResponseDto,
  HikerApiRawResponse,
} from './hiker-api.dto';

@Injectable()
export class HikerApiService {
  private readonly logger = new Logger(HikerApiService.name);
  private readonly apiKey: string | null;
  private readonly isMock: boolean;
  private readonly baseUrl = 'https://api.hikerapi.com';

  constructor(private readonly configService: ConfigService) {
    const key = this.configService.get<string>('HIKER_API_KEY');
    const mockOverride = this.configService.get<string>('HIKER_MOCK');

    this.apiKey = key ?? null;
    // Mock mode when:
    // 1. HIKER_MOCK=true is explicitly set, OR
    // 2. HIKER_API_KEY is missing/empty
    this.isMock = mockOverride === 'true' || !this.apiKey;

    if (this.isMock) {
      this.logger.warn(
        'HikerAPI running in MOCK mode — no real API calls will be made',
      );
    } else {
      this.logger.log(
        'HikerAPI running in LIVE mode — real API calls will be made',
      );
    }
  }

  // ──────────────────────────────────────────────
  // Public API
  // ──────────────────────────────────────────────

  async lookup(dto: HikerApiLookupDto): Promise<HikerApiResponseDto> {
    if (!dto.url || typeof dto.url !== 'string' || dto.url.trim().length === 0) {
      throw new HttpException('url is required', HttpStatus.BAD_REQUEST);
    }

    const url = dto.url.trim();

    if (this.isMock) {
      return this.getMockData(url);
    }

    return this.callRealApi(url);
  }

  async lookupByUrl(url: string): Promise<HikerApiResponseDto> {
    return this.lookup({ url });
  }

  // ──────────────────────────────────────────────
  // Real API call via native fetch
  // ──────────────────────────────────────────────

  private async callRealApi(instagramUrl: string): Promise<HikerApiResponseDto> {
    const encodedUrl = encodeURIComponent(instagramUrl);
    const requestUrl = `${this.baseUrl}/v2/media/info/by/url?url=${encodedUrl}`;

    this.logger.debug(`Calling HikerAPI: GET /v2/media/info/by/url`);

    let response: Response;
    try {
      response = await fetch(requestUrl, {
        method: 'GET',
        headers: {
          'x-access-key': this.apiKey!,
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(15_000),
      });
    } catch (err: any) {
      this.logger.error(`HikerAPI request failed: ${err.message}`);
      if (err.name === 'TimeoutError' || err.name === 'AbortError') {
        throw new HttpException(
          'HikerAPI request timed out',
          HttpStatus.GATEWAY_TIMEOUT,
        );
      }
      throw new HttpException(
        `HikerAPI request failed: ${err.message}`,
        HttpStatus.BAD_GATEWAY,
      );
    }

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      this.logger.error(
        `HikerAPI returned ${response.status}: ${body.slice(0, 300)}`,
      );
      throw new HttpException(
        `HikerAPI returned ${response.status}`,
        response.status >= 500
          ? HttpStatus.BAD_GATEWAY
          : HttpStatus.BAD_REQUEST,
      );
    }

    let raw: HikerApiRawResponse;
    try {
      raw = (await response.json()) as HikerApiRawResponse;
    } catch {
      throw new HttpException(
        'Invalid JSON from HikerAPI',
        HttpStatus.BAD_GATEWAY,
      );
    }

    return this.mapResponse(raw);
  }

  // ──────────────────────────────────────────────
  // Response mapping
  // ──────────────────────────────────────────────

  private mapResponse(raw: HikerApiRawResponse): HikerApiResponseDto {
    const bestCandidate =
      raw.image_versions2?.candidates?.sort(
        (a, b) => b.width * b.height - a.width * a.height,
      )[0] ?? null;

    return {
      media_id: raw.pk ?? raw.id ?? raw.code ?? '',
      image_url: bestCandidate?.url ?? '',
      caption: raw.caption?.text ?? null,
      like_count: raw.like_count ?? 0,
      comment_count: raw.comment_count ?? 0,
      username: raw.user?.username ?? '',
      taken_at: raw.taken_at ?? Math.floor(Date.now() / 1000),
      media_type: raw.media_type ?? 1,
    };
  }

  // ──────────────────────────────────────────────
  // Mock data
  // ──────────────────────────────────────────────

  private getMockData(instagramUrl: string): HikerApiResponseDto {
    // Generate deterministic mock data based on the URL
    const urlHash = this.simpleHash(instagramUrl);

    return {
      media_id: `mock_${urlHash}`,
      image_url: `https://picsum.photos/seed/${urlHash}/640/640`,
      caption: `Mock Instagram post for ${instagramUrl}`,
      like_count: 100 + (urlHash.charCodeAt(0) % 900),
      comment_count: 10 + (urlHash.charCodeAt(1) % 90),
      username: `mock_user_${urlHash.slice(0, 6)}`,
      taken_at: Math.floor(Date.now() / 1000) - urlHash.charCodeAt(2) * 3600,
      media_type: 1,
    };
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const chr = str.charCodeAt(i);
      hash = (hash << 5) - hash + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16).slice(0, 12);
  }
}
