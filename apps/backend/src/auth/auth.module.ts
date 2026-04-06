import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { BalanceService } from '@src/balance/balance.service';
import { UserService } from '@src/user/user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CookieTokenService } from './services/cookieToken.service';
import { MailService } from './services/mail.service';
import { TokenSevice } from './services/token.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshStrategy } from './strategies/refresh.strategy';

@Module({
    imports: [PassportModule, JwtModule.register({})],
    controllers: [AuthController],
    providers: [
        AuthService,
        UserService,
        PrismaService,
        RefreshStrategy,
        TokenSevice,
        CookieTokenService,
        MailService,
        JwtStrategy,
        BalanceService,
    ],
    exports: [JwtModule],
})
export class AuthModule {}
