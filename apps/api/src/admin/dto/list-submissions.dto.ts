import { ApiPropertyOptional } from '@nestjs/swagger';
import { GroupBuyStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';

export class ListSubmissionsDto {
  @ApiPropertyOptional({ enum: GroupBuyStatus, default: GroupBuyStatus.REVIEW_REQUIRED })
  @IsOptional()
  @IsEnum(GroupBuyStatus)
  status: GroupBuyStatus = GroupBuyStatus.REVIEW_REQUIRED;

  @ApiPropertyOptional({ default: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit = 50;
}
