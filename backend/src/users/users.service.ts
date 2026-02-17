import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, username: true, role: true, avatar: true, createdAt: true, artistProfile: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(id: string, data: { username?: string; bio?: string }) {
    const { bio, ...userData } = data;
    const user = await this.prisma.user.update({
      where: { id },
      data: userData,
      select: { id: true, email: true, username: true, role: true, avatar: true },
    });
    if (bio !== undefined) {
      await this.prisma.artistProfile.updateMany({ where: { userId: id }, data: { bio } });
    }
    return user;
  }

  async getArtists(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    return this.prisma.artistProfile.findMany({
      skip, take: limit, orderBy: { earnings: 'desc' },
      include: { user: { select: { id: true, username: true, avatar: true } }, _count: { select: { tracks: true, liveSessions: true } } },
    });
  }
}
