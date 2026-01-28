import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CookieTokenService } from '@src/auth/services/cookieToken.service';
import { MailService } from '@src/auth/services/mail.service';
import { TokenSevice } from '@src/auth/services/token.service';
import { PrismaService } from '@src/prisma/prisma.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
    imports: [JwtModule.register({})],
    controllers: [UserController],
    providers: [
        UserService,
        PrismaService,
        MailService,
        TokenSevice,
        CookieTokenService,
    ],
    exports: [UserService],
})
export class UserModule {}
