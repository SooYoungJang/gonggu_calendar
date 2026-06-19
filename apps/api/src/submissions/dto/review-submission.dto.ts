import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength, IsBoolean, MinLength } from 'class-validator';

export class ApproveSubmissionDto {
  @ApiPropertyOptional({ example: true, description: '캘린더에 종일 일정으로 표시' })
  @IsOptional()
  @IsBoolean()
  isAllDay?: boolean = false;

  @ApiPropertyOptional({ example: '자동 승인: 신뢰도 높음', description: '운영자 메모' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  adminMemo?: string;
}

export class RejectSubmissionDto {
  @ApiProperty({ example: '정보 부족 (구매 링크 없음)', description: '반려 사유 (필수)' })
  @IsString()
  @MinLength(5)
  @MaxLength(500)
  reason!: string;

  @ApiPropertyOptional({ example: '구매 링크와 마감일을 추가해 주시면 재검토 가능합니다.', description: '제보자 안내 메시지' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  guideMessage?: string;
}

export class MergeSubmissionDto {
  @ApiProperty({ example: 'uuid-of-duplicate-submission', description: '병합할 대상 제보 ID' })
  @IsString()
  targetId!: string;
}