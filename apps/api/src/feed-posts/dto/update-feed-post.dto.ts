import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, IsUrl } from 'class-validator';

import { CreateFeedPostDto } from './create-feed-post.dto';

export class UpdateFeedPostDto extends PartialType(CreateFeedPostDto) {
  @ApiPropertyOptional({ description: 'Thumbnail image URL (from OG parsing)' })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @ApiPropertyOptional({ description: 'Media URL (from OG parsing)' })
  @IsOptional()
  @IsString()
  mediaUrl?: string;

  @ApiPropertyOptional({ description: 'Account/author name' })
  @IsOptional()
  @IsString()
  accountName?: string;

  @ApiPropertyOptional({ description: 'Sort order (lower = earlier)' })
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
