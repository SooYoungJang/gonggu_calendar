import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateFeedPostDto {
  @ApiProperty({ description: 'Instagram post URL' })
  @IsUrl({ host_whitelist: ['instagram.com', 'www.instagram.com'] })
  instagramUrl!: string;

  @ApiPropertyOptional({ description: 'External link URL (e.g. product page)' })
  @IsOptional()
  @IsUrl()
  linkUrl?: string;

  @ApiPropertyOptional({ description: 'Feed open date (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  openDate?: string;

  @ApiPropertyOptional({ description: 'Feed close date (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  closeDate?: string;

  @ApiPropertyOptional({ description: 'Caption / description text' })
  @IsOptional()
  @IsString()
  caption?: string;
}
