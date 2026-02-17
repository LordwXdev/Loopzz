import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LiveService {
  constructor(private prisma: PrismaService) {}

  async startSession(userId: string, title: string) {
    const artist = await this.prisma.artistProfile.findUnique({ where: { userId } });
    if (!artist) throw new ForbiddenException('Only artists can start live sessions');
    await this.prisma.liveSession.updateMany({ where: { artistId: artist.id, isActive: true }, data: { isActive: false, endedAt: new Date() } });
    return this.prisma.liveSession.create({
      data: { artistId: artist.id, title },
      include: { artist: { include: { user: { select: { id: true, username: true, avatar: true } } } } },
    });
  }

  async endSession(userId: string, sessionId: string) {
    const artist = await this.prisma.artistProfile.findUnique({ where: { userId } });
    if (!artist) throw new ForbiddenException('Not authorized');
    const session = await this.prisma.liveSession.findUnique({ where: { id: sessionId } });
    if (!session || session.artistId !== artist.id) throw new NotFoundException('Session not found');
    return this.prisma.liveSession.update({ where: { id: sessionId }, data: { isActive: false, endedAt: new Date() } });
  }

  async getActiveSessions() {
    return this.prisma.liveSession.findMany({
      where: { isActive: true }, orderBy: { viewers: 'desc' },
      include: { artist: { include: { user: { select: { id: true, username: true, avatar: true } } } } },
    });
  }

  async getSession(id: string) {
    const session = await this.prisma.liveSession.findUnique({
      where: { id },
      include: { artist: { include: { user: { select: { id: true, username: true, avatar: true } } } } },
    });
    if (!session) throw new NotFoundException('Session not found');
    return session;
  }
}
