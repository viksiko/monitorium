import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { LoggerMiddleware } from '@shared/middleware';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BalanceModule } from './balance/balance.module';
import { CommentModule } from './comment/comment.module';
import { DialogModule } from './dialog/dialog.module';
import { DistrictModule } from './district/district.module';
import { PostModule } from './post/post.module';
import { PrismaModule } from './prisma/prisma.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { TaskModule } from './task/task.module';
import { UserModule } from './user/user.module';

@Module({
    imports: [
        PrismaModule,
        AuthModule,
        ConfigModule.forRoot({ isGlobal: true }),
        UserModule,
        ThrottlerModule.forRoot([
            {
                ttl: 60000, // 1 мин
                limit: 3, // 3 запроса
            },
        ]),
        TaskModule,
        CommentModule,
        SubscriptionsModule,
        PostModule,
        DialogModule,
        DistrictModule,
        BalanceModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer): void {
        consumer.apply(LoggerMiddleware).forRoutes('*');
    }
}
