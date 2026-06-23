import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HikerApiService } from './hiker-api.service';
import { HikerApiLookupDto, HikerApiResponseDto } from './hiker-api.dto';

@ApiTags('HikerAPI')
@Controller('api/v1/hiker-api')
export class HikerApiController {
  constructor(
    @Inject(HikerApiService) private readonly hikerApiService: HikerApiService,
  ) {}

  @Post('lookup')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Lookup Instagram media info via HikerAPI',
    description:
      'Accepts an Instagram URL and returns structured media data. Runs in mock mode when HIKER_API_KEY is not configured.',
  })
  @ApiResponse({
    status: 200,
    description: 'Media info retrieved successfully',
    type: HikerApiResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid request or HikerAPI error' })
  @ApiResponse({ status: 502, description: 'HikerAPI upstream error' })
  @ApiResponse({ status: 504, description: 'HikerAPI timeout' })
  async lookup(
    @Body() dto: HikerApiLookupDto,
  ): Promise<HikerApiResponseDto> {
    return this.hikerApiService.lookup(dto);
  }
}
