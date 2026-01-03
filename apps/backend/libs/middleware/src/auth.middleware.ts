import {
    Injectable,
    NestMiddleware,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TOKEN_INVALID } from '@src/constants/api-messages.constants';
import { logger } from '@src/logger/winston.logger';
import { JwtPayload } from '@src/types/auth';
import { UserService } from '@src/user/user.service';
import { NextFunction, Response } from 'express';
import { ExpressRequest } from '../../../src/types/expressRequest.interface';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    constructor(
        private readonly userService: UserService,
        private readonly jwt: JwtService,
        private readonly configService: ConfigService,
    ) {}

    async use(
        req: ExpressRequest,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            req.user = undefined;
            return next();
        }

        const token = authHeader.split(' ')[1];

        let payload: JwtPayload;

        try {
            payload = this.jwt.verify(token, {
                secret: this.configService.get('JWT_ACCESS_SECRET'),
            });
        } catch (error) {
            logger.warn('Verify access token failed', {
                category: 'token',
                operation: 'AuthMiddleware',
                jwtError: error instanceof Error ? error.message : error,
            });

            req.user = undefined;
            throw new UnauthorizedException(TOKEN_INVALID);
        }

        const user = await this.userService.findUserById(payload.id as string);

        if (!user) {
            throw new UnauthorizedException(TOKEN_INVALID);
        }

        req.user = user;

        next();
    }
}
