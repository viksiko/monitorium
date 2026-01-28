import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { LoggerMiddleware } from '@shared/middleware';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
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
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer): void {
        consumer.apply(LoggerMiddleware).forRoutes('*');
    }
}
