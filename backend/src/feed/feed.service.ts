import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FeedService {
  constructor(private prisma: PrismaService) {}

  async getFeed(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [videos, tracks] = await Promise.all([
      this.prisma.video.findMany({ orderBy: { createdAt: 'desc' }, take: 50, include: { user: { select: { id: true, username: true, avatar: true } } } }),
      this.prisma.track.findMany({ orderBy: { plays: 'desc' }, take: 50, include: { artist: { include: { user: { select: { id: true, username: true, avatar: true } } } } } }),
    ]);

    const scoredVideos = videos.map((v) => ({ ...v, type: 'video' as const, score: this.scoreVideo(v.views, v.likes, v.createdAt) }));
    const scoredTracks = tracks.map((t) => ({ ...t, type: 'track' as const, score: t.plays * 1.5 }));

    const feed = [...scoredVideos, ...scoredTracks].sort((a, b) => b.score - a.score).slice(skip, skip + limit);
    return { feed, total: videos.length + tracks.length, page, totalPages: Math.ceil((videos.length + tracks.length) / limit) };
  }

  async getTrending() {
    const [videos, tracks, artists] = await Promise.all([
      this.prisma.video.findMany({ orderBy: { views: 'desc' }, take: 10, include: { user: { select: { id: true, username: true, avatar: true } } } }),
      this.prisma.track.findMany({ orderBy: { plays: 'desc' }, take: 10, include: { artist: { include: { user: { select: { id: true, username: true } } } } } }),
      this.prisma.artistProfile.findMany({ orderBy: { earnings: 'desc' }, take: 10, include: { user: { select: { id: true, username: true, avatar: true } } } }),
    ]);
    return { videos, tracks, artists };
  }

  private scoreVideo(views: number, likes: number, createdAt: Date): number {
    const ageHours = (Date.now() - new Date(createdAt).getTime()) / 3600000;
    const recencyBoost = Math.max(0, 100 - ageHours * 2);
    const engagementRate = views > 0 ? (likes / views) * 100 : 0;
    return views * 0.3 + likes * 2 + engagementRate * 10 + recencyBoost;
  }
}
