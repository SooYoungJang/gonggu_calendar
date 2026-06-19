import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { InfluencersService } from './influencers.service';

@ApiTags('influencers')
@Controller('influencers')
export class InfluencersController {
  constructor(private readonly influencersService: InfluencersService) {}

  @Get()
  list() {
    return this.influencersService.listActive();
  }
}
