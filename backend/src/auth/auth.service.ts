import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.email }, { username: dto.username }] },
    });
    if (existing) throw new ConflictException('Email or username already taken');

    const hashedPassword = await bcrypt.hash(dto.password, 12);
    const role = dto.role || 'USER';

    const user = await this.prisma.user.create({
      data: { email: dto.email, username: dto.username, password: hashedPassword, role: role as any },
    });

    if (role === 'ARTIST') {
      await this.prisma.artistProfile.create({ data: { userId: user.id } });
    }

    if (dto.referralCode) {
      const referrer = await this.prisma.user.findUnique({ where: { id: dto.referralCode } });
      if (referrer) {
        await this.prisma.referral.create({
          data: { referrerId: referrer.id, referredId: user.id, rewardEarned: 0 },
        });
      }
    }

    const token = this.jwtService.sign({ sub: user.id, email: user.email, role: user.role });
    return { token, user: { id: user.id, email: user.email, username: user.username, role: user.role } };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    const token = this.jwtService.sign({ sub: user.id, email: user.email, role: user.role });
    return { token, user: { id: user.id, email: user.email, username: user.username, role: user.role } };
  }

  async getProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, username: true, role: true, avatar: true, createdAt: true, artistProfile: true },
    });
  }
}
