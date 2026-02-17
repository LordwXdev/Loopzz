import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
@UseGuards(AuthGuard('jwt'))
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  @Get()
  getMyTransactions(@Req() req: any, @Query('page') page: string) { return this.transactionsService.getByUser(req.user.id, Number(page) || 1); }

  @Get('earnings')
  getEarnings(@Req() req: any) { return this.transactionsService.getEarningsSummary(req.user.id); }
}
