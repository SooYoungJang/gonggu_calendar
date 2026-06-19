import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateSubmissionDto {
  @ApiProperty()
  @IsString()
  influencerUsername!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  influencerDisplayName?: string;

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
  @IsString()
  productName!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  brandName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  purchaseUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  discountInfo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  summary?: string;
}
