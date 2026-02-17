import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { VideosModule } from './videos/videos.module';
import { TracksModule } from './tracks/tracks.module';
import { LiveModule } from './live/live.module';
import { TipsModule } from './tips/tips.module';
import { ReferralsModule } from './referrals/referrals.module';
import { TransactionsModule } from './transactions/transactions.module';
import { FeedModule } from './feed/feed.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PrismaModule, AuthModule, UsersModule, VideosModule, TracksModule,
    LiveModule, TipsModule, ReferralsModule, TransactionsModule, FeedModule, ChatModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
