import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TracksService {
  constructor(private prisma: PrismaService) {}

  async upload(userId: string, file: Express.Multer.File, title: string) {
    const artist = await this.prisma.artistProfile.findUnique({ where: { userId } });
    if (!artist) throw new ForbiddenException('Only artists can upload tracks');
    const url = `/uploads/${file.filename}`;
    return this.prisma.track.create({
      data: { artistId: artist.id, url, title },
      include: { artist: { include: { user: { select: { id: true, username: true } } } } },
    });
  }

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [tracks, total] = await Promise.all([
      this.prisma.track.findMany({ skip, take: limit, orderBy: { plays: 'desc' }, include: { artist: { include: { user: { select: { id: true, username: true } } } } } }),
      this.prisma.track.count(),
    ]);
    return { tracks, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const track = await this.prisma.track.findUnique({ where: { id }, include: { artist: { include: { user: { select: { id: true, username: true } } } } } });
    if (!track) throw new NotFoundException('Track not found');
    await this.prisma.track.update({ where: { id }, data: { plays: { increment: 1 } } });
    return track;
  }

  async findByArtist(artistId: string) {
    return this.prisma.track.findMany({ where: { artistId }, orderBy: { plays: 'desc' }, include: { artist: { include: { user: { select: { id: true, username: true } } } } } });
  }
}
