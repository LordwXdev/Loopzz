import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async getByUser(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({ where: { userId }, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.transaction.count({ where: { userId } }),
    ]);
    return { transactions, total, page, totalPages: Math.ceil(total / limit) };
  }

  async getEarningsSummary(userId: string) {
    const artist = await this.prisma.artistProfile.findUnique({ where: { userId } });
    if (!artist) return { totalEarnings: 0, totalTips: 0, recentTips: [] };
    const recentTips = await this.prisma.tip.findMany({
      where: { toArtistId: artist.id }, orderBy: { createdAt: 'desc' }, take: 10,
      include: { fromUser: { select: { username: true } } },
    });
    return { totalEarnings: artist.earnings, totalTips: await this.prisma.tip.count({ where: { toArtistId: artist.id } }), recentTips };
  }
}
