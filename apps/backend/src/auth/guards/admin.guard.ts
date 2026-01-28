import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { FORBIDDEN_RESOURCE } from '@src/constants/api-messages.constants';

@Injectable()
export class AdminGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();

        if (request.user?.role !== Role.ADMIN) {
            throw new ForbiddenException(FORBIDDEN_RESOURCE);
        }

        return true;
    }
}
