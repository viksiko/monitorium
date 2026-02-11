import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { AUTHORIZATION_REQUIRED } from '@src/constants/api-messages.constants';
import { JWT_ACCESS_SECRET_NOT_DEFINED } from '@src/constants/app.constants';
import { JwtPayload } from '@src/types/auth';
import { UserResponse } from '@src/types/user';
import { UserService } from '@src/user/user.service';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly configService: ConfigService,
        private readonly userService: UserService,
    ) {
        const secret = configService.get<string>('JWT_ACCESS_SECRET');
        if (!secret) {
            throw new Error(JWT_ACCESS_SECRET_NOT_DEFINED);
        }
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: secret,
        });
    }

    async validate(payload: JwtPayload): Promise<UserResponse> {
        const user = await this.userService.findUserById(payload.id);

        if (!user) {
            throw new UnauthorizedException(AUTHORIZATION_REQUIRED);
        }

        return user;
    }
}
