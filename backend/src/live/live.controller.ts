import { Controller, Post, Get, Param, Body, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LiveService } from './live.service';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('live')
export class LiveController {
  constructor(private liveService: LiveService) {}

  @Post('start')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ARTIST')
  start(@Req() req: any, @Body('title') title: string) { return this.liveService.startSession(req.user.id, title || 'Live Session'); }

  @Post(':id/end')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ARTIST')
  end(@Req() req: any, @Param('id') id: string) { return this.liveService.endSession(req.user.id, id); }

  @Get()
  getActive() { return this.liveService.getActiveSessions(); }

  @Get(':id')
  getSession(@Param('id') id: string) { return this.liveService.getSession(id); }
}
