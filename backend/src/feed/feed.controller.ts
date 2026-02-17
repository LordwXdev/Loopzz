import { Controller, Get, Query } from '@nestjs/common';
import { FeedService } from './feed.service';

@Controller('feed')
export class FeedController {
  constructor(private feedService: FeedService) {}

  @Get()
  getFeed(@Query('page') page: string, @Query('limit') limit: string) { return this.feedService.getFeed(Number(page) || 1, Number(limit) || 20); }

  @Get('trending')
  getTrending() { return this.feedService.getTrending(); }
}
