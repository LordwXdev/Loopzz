import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TipsService {
  constructor(private prisma: PrismaService) {}

  async sendTip(fromUserId: string, toArtistId: string, amount: number, message?: string) {
    if (amount <= 0) throw new BadRequestException('Tip amount must be positive');
    if (amount > 10000) throw new BadRequestException('Tip amount exceeds maximum');

    const artist = await this.prisma.artistProfile.findUnique({ where: { id: toArtistId }, include: { user: true } });
    if (!artist) throw new NotFoundException('Artist not found');
    if (artist.userId === fromUserId) throw new BadRequestException('You cannot tip yourself');

    const tip = await this.prisma.tip.create({ data: { fromUserId, toArtistId, amount, message } });
    await this.prisma.artistProfile.update({ where: { id: toArtistId }, data: { earnings: { increment: amount } } });

    await this.prisma.transaction.createMany({
      data: [
        { userId: fromUserId, type: 'TIP_SENT', amount, status: 'COMPLETED', metadata: JSON.stringify({ tipId: tip.id }) },
        { userId: artist.userId, type: 'TIP_RECEIVED', amount, status: 'COMPLETED', metadata: JSON.stringify({ tipId: tip.id }) },
      ],
    });

    // Referral reward (5%)
    const referral = await this.prisma.referral.findUnique({ where: { referredId: fromUserId } });
    if (referral) {
      const reward = amount * 0.05;
      await this.prisma.referral.update({ where: { id: referral.id }, data: { rewardEarned: { increment: reward } } });
      await this.prisma.transaction.create({
        data: { userId: referral.referrerId, type: 'REFERRAL_REWARD', amount: reward, status: 'COMPLETED', metadata: JSON.stringify({ tipId: tip.id }) },
      });
    }
    return tip;
  }

  async getTipsForArtist(artistId: string) {
    return this.prisma.tip.findMany({ where: { toArtistId: artistId }, orderBy: { createdAt: 'desc' }, include: { fromUser: { select: { id: true, username: true } } } });
  }

  async getTipsByUser(userId: string) {
    return this.prisma.tip.findMany({ where: { fromUserId: userId }, orderBy: { createdAt: 'desc' }, include: { toArtist: { include: { user: { select: { id: true, username: true } } } } } });
  }
}
