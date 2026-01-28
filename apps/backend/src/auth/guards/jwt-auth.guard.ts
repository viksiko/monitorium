import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@prisma/client';
import { AUTHORIZATION_REQUIRED } from '@src/constants/api-messages.constants';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    handleRequest<TUser = User>(err: unknown, user: TUser | false): TUser {
        if (err || !user) {
            throw new UnauthorizedException(AUTHORIZATION_REQUIRED);
        }

        return user;
    }
}
