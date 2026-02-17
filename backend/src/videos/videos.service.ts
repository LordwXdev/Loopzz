import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VideosService {
  constructor(private prisma: PrismaService) {}

  async upload(userId: string, file: Express.Multer.File, caption: string) {
    const url = `/uploads/${file.filename}`;
    return this.prisma.video.create({
      data: { userId, url, caption },
      include: { user: { select: { id: true, username: true, avatar: true } } },
    });
  }

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [videos, total] = await Promise.all([
      this.prisma.video.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' }, include: { user: { select: { id: true, username: true, avatar: true } } } }),
      this.prisma.video.count(),
    ]);
    return { videos, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const video = await this.prisma.video.findUnique({ where: { id }, include: { user: { select: { id: true, username: true, avatar: true } } } });
    if (!video) throw new NotFoundException('Video not found');
    await this.prisma.video.update({ where: { id }, data: { views: { increment: 1 } } });
    return video;
  }

  async like(id: string) {
    return this.prisma.video.update({ where: { id }, data: { likes: { increment: 1 } } });
  }

  async findByUser(userId: string) {
    return this.prisma.video.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, include: { user: { select: { id: true, username: true, avatar: true } } } });
  }
}
