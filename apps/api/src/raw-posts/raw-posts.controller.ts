import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CollectRawPostDto } from './dto/collect-raw-post.dto';
import { ListRawPostsDto } from './dto/list-raw-posts.dto';
import { RawPostsService } from './raw-posts.service';

@ApiTags('raw-posts')
@Controller('raw-posts')
export class RawPostsController {
  constructor(private readonly rawPostsService: RawPostsService) {}

  @Get()
  list(@Query() query: ListRawPostsDto) {
    return this.rawPostsService.list(query);
  }

  @Post('collect')
  collect(@Body() dto: CollectRawPostDto) {
    return this.rawPostsService.collect(dto);
  }
}
