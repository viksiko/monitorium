import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from '@src/user/user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CookieTokenService } from './services/cookieToken.service';
import { MailService } from './services/mail.service';
import { TokenSevice } from './services/token.service';
import { AccessStrategy } from './strategies/access.strategy';
import { RefreshStrategy } from './strategies/refresh.strategy';

@Module({
    imports: [JwtModule.register({})],
    controllers: [AuthController],
    providers: [
        AuthService,
        UserService,
        PrismaService,
        AccessStrategy,
        RefreshStrategy,
        TokenSevice,
        CookieTokenService,
        MailService,
    ],
    exports: [JwtModule],
})
export class AuthModule {}
