import { IsOptional, IsString, IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ──────────────────────────────────────────────
// Request DTO
// ──────────────────────────────────────────────
export class HikerApiLookupDto {
  @ApiProperty({ description: 'Instagram URL to lookup' })
  @IsString()
  @IsNotEmpty()
  url!: string;
}

// ──────────────────────────────────────────────
// Response DTO — mirrors the HikerAPI response shape
// ──────────────────────────────────────────────
export class HikerApiResponseDto {
  @ApiProperty({ description: 'Instagram media ID' })
  media_id!: string;

  @ApiProperty({ description: 'Best-quality image URL of the post' })
  image_url!: string;

  @ApiPropertyOptional({ description: 'Caption text' })
  caption!: string | null;

  @ApiProperty({ description: 'Number of likes' })
  like_count!: number;

  @ApiProperty({ description: 'Number of comments' })
  comment_count!: number;

  @ApiProperty({ description: 'Post author username' })
  username!: string;

  @ApiProperty({ description: 'Unix timestamp of when the media was posted' })
  taken_at!: number;

  @ApiProperty({ description: 'Media type (e.g. 1 = image, 2 = video, 8 = carousel)' })
  media_type!: number;
}

// ──────────────────────────────────────────────
// Internal type for the raw HikerAPI response
// ──────────────────────────────────────────────
export interface HikerApiRawResponse {
  image_versions2?: {
    candidates?: Array<{ url: string; width: number; height: number }>;
  };
  like_count?: number;
  comment_count?: number;
  caption?: { text?: string } | null;
  user?: { username?: string };
  taken_at?: number;
  media_type?: number;
  id?: string;
  pk?: string;
  code?: string;
}
