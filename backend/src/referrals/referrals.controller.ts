import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReferralsService } from './referrals.service';

@Controller('referrals')
@UseGuards(AuthGuard('jwt'))
export class ReferralsController {
  constructor(private referralsService: ReferralsService) {}

  @Get()
  getMyReferrals(@Req() req: any) { return this.referralsService.getMyReferrals(req.user.id); }

  @Get('code')
  getCode(@Req() req: any) { return this.referralsService.getReferralCode(req.user.id); }
}
