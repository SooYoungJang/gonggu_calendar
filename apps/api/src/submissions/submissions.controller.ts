import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

import { ApproveSubmissionDto } from './dto/review-submission.dto';
import { RejectSubmissionDto } from './dto/review-submission.dto';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { ListSubmissionsDto } from './dto/list-submissions.dto';
import { SubmissionsService } from './submissions.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { createSubmissionSchema, listSubmissionsSchema } from './submissions.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('submissions')
@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Post()
  create(@Body(new ZodValidationPipe(createSubmissionSchema)) dto: CreateSubmissionDto) {
    return this.submissionsService.create(dto);
  }

  @Get()
  list(@Query(new ZodValidationPipe(listSubmissionsSchema)) query: ListSubmissionsDto) {
    return this.submissionsService.findAll(query);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.submissionsService.findById(id);
  }

  @Get(':id/status')
  getStatus(@Param('id') id: string) {
    return this.submissionsService.getStatus(id);
  }

  @Delete(':id')
  cancel(@Param('id') id: string) {
    return this.submissionsService.cancel(id);
  }
}

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/submissions')
export class AdminSubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Get()
  list(@Query() query: ListSubmissionsDto) {
    return this.submissionsService.findAll(query);
  }

  @Get('cursor')
  listCursor(@Query() query: ListSubmissionsDto) {
    return this.submissionsService.findAllCursor(query);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.submissionsService.findById(id);
  }

  @Patch(':id/approve')
  approve(@Param('id') id: string, @Body() dto: ApproveSubmissionDto) {
    // TODO: 관리자 ID 추출 (향후 인증 연동 시)
    const adminId = 'admin';
    return this.submissionsService.approve(id, dto, adminId);
  }

  @Patch(':id/reject')
  reject(@Param('id') id: string, @Body() dto: RejectSubmissionDto) {
    const adminId = 'admin';
    return this.submissionsService.reject(id, dto, adminId);
  }
}