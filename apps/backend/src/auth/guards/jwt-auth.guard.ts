import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@prisma/client';
import { AUTHORIZATION_REQUIRED } from '@src/constants/api-messages.constants';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from '../decorator/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private reflector: Reflector) {
        super();
    }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) {
            return true; // пропускаем без JWT
        }

        return super.canActivate(context);
    }

    handleRequest<TUser = User>(err: unknown, user: TUser | false): TUser {
        if (err || !user) {
            throw new UnauthorizedException(AUTHORIZATION_REQUIRED);
        }

        return user;
    }
}
