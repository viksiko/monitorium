import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { USER_NOT_AUTHORIZED } from '@src/constants/api-messages.constants';
import { ExpressRequest } from '@src/types/expressRequest.interface';

@Injectable()
export class AuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<ExpressRequest>();

        if (!request.user) {
            throw new UnauthorizedException(USER_NOT_AUTHORIZED);
        }

        return true;
    }
}
