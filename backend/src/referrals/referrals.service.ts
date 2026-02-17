import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReferralsService {
  constructor(private prisma: PrismaService) {}

  async getMyReferrals(userId: string) {
    const referrals = await this.prisma.referral.findMany({
      where: { referrerId: userId },
      include: { referred: { select: { id: true, username: true, createdAt: true } } },
      orderBy: { createdAt: 'desc' },
    });
    const totalEarned = referrals.reduce((sum, r) => sum + r.rewardEarned, 0);
    return { referrals, totalEarned, count: referrals.length };
  }

  async getReferralCode(userId: string) { return { referralCode: userId }; }
}
