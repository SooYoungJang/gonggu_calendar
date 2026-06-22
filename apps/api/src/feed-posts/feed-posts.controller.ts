import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CreateFeedPostDto } from './dto/create-feed-post.dto';
import { ListFeedPostsDto } from './dto/list-feed-posts.dto';
import { UpdateFeedPostDto } from './dto/update-feed-post.dto';
import { FeedPostsService } from './feed-posts.service';

@ApiTags('feed-posts')
@Controller('feeds')
export class FeedPostsController {
  constructor(private readonly feedPostsService: FeedPostsService) {}

  @Get()
  @ApiOperation({ summary: '피드 목록 조회', description: '활성 피드 목록을 최신순으로 페이지네이션하여 반환합니다.' })
  @ApiOkResponse({ description: '피드 목록 (items + meta)' })
  list(@Query() query: ListFeedPostsDto) {
    return this.feedPostsService.list(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '피드 상세 조회' })
  @ApiOkResponse({ description: '피드 상세 정보' })
  get(@Param('id') id: string) {
    return this.feedPostsService.get(id);
  }

  @Post()
  @ApiOperation({ summary: '피드 등록', description: '새 피드를 등록합니다. OG 메타데이터 파싱은 BullMQ 워커가 비동기 처리합니다.' })
  @ApiCreatedResponse({ description: '등록된 피드' })
  create(@Body() dto: CreateFeedPostDto) {
    return this.feedPostsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: '피드 수정' })
  @ApiOkResponse({ description: '수정된 피드' })
  update(@Param('id') id: string, @Body() dto: UpdateFeedPostDto) {
    return this.feedPostsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '피드 삭제', description: 'soft delete (isActive = false)' })
  @ApiOkResponse({ description: '삭제된 피드 (isActive=false)' })
  remove(@Param('id') id: string) {
    return this.feedPostsService.remove(id);
  }
}
