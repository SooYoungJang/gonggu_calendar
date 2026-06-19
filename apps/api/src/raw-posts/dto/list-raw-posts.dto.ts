import { ApiPropertyOptional } from '@nestjs/swagger';
import { ParsingStatus } from '@prisma/client';
import { IsBooleanString, IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ListRawPostsDto {
  @ApiPropertyOptional({ enum: ParsingStatus })
  @IsOptional()
  @IsEnum(ParsingStatus)
  parsingStatus?: ParsingStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBooleanString()
  isCandidate?: string;

  @ApiPropertyOptional({ default: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit = 50;
}
