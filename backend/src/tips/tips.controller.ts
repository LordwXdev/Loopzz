import { Controller, Post, Get, Body, Req, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TipsService } from './tips.service';

@Controller('tips')
@UseGuards(AuthGuard('jwt'))
export class TipsController {
  constructor(private tipsService: TipsService) {}

  @Post()
  send(@Req() req: any, @Body() body: { toArtistId: string; amount: number; message?: string }) {
    return this.tipsService.sendTip(req.user.id, body.toArtistId, body.amount, body.message);
  }

  @Get('artist/:artistId')
  getForArtist(@Param('artistId') artistId: string) { return this.tipsService.getTipsForArtist(artistId); }

  @Get('my')
  getMyTips(@Req() req: any) { return this.tipsService.getTipsByUser(req.user.id); }
}
