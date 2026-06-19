import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsUrl } from 'class-validator';

export class CollectRawPostDto {
  @ApiProperty()
  @IsString()
  instagramPostId!: string;

  @ApiProperty()
  @IsString()
  influencerUsername!: string;

  @ApiProperty()
  @IsString()
  caption!: string;

  @ApiProperty()
  @IsUrl()
  postUrl!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiProperty()
  @IsDateString()
  takenAt!: string;

  @ApiProperty()
  @IsDateString()
  collectedAt!: string;
}
