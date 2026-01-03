import * as crypto from 'crypto';
import { UserProfile } from '@monorepo/types';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TOKEN_INVALID } from '@src/constants/api-messages.constants';
import { logger } from '@src/logger/winston.logger';
import { PrismaService } from '@src/prisma/prisma.service';
import { JwtPayload } from '@src/types/auth';
import { Response } from 'express';

@Injectable()
export class TokenSevice {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) {}

    // Генерация токенов доступа
    async generateTokens(
        payload: JwtPayload,
        response: Response,
    ): Promise<{
        accessToken: string;
        userProfile: UserProfile;
    }> {
        const accessToken = this.jwtService.sign<JwtPayload>(payload, {
            secret: this.configService.get('JWT_ACCESS_SECRET'),
            expiresIn: this.configService.get('JWT_ACCESS_EXPIRES'),
        });

        const refreshToken = this.jwtService.sign<JwtPayload>(payload, {
            secret: this.configService.get('JWT_REFRESH_SECRET'),
            expiresIn: this.configService.get('JWT_REFRESH_EXPIRES'),
        });

        const decodedToken = this.jwtService.decode(refreshToken);

        // Преобразует время истечения срока действия токена
        const expiresAt = new Date(decodedToken.exp * 1000);

        await this.saveRefreshToken(payload.id, refreshToken, expiresAt);

        this.setRefreshTokenCookie(response, refreshToken);

        return {
            accessToken,
            userProfile: {
                name: payload.name,
                email: payload.email,
                phone: payload.phone || '',
                role: payload.role,
            },
        };
    }

    // Сохранение refresh токена в базу
    private async saveRefreshToken(
        userId: string,
        refreshToken: string,
        expiresAt: Date,
    ): Promise<void> {
        const hashed = this.hashToken(
            refreshToken,
            this.configService.get('JWT_REFRESH_SALT'),
        );

        try {
            await this.prisma.token.create({
                data: {
                    hashedToken: hashed,
                    type: 'REFRESH',
                    userId,
                    exp: expiresAt,
                },
            });
        } catch (error) {
            logger.error('Failed to create refresh token', {
                category: 'database',
                operation: 'saveRefreshToken',
                error: error instanceof Error ? error.message : error,
            });
            throw error;
        }
    }

    // Хеширование для токенов перед сохранением в базу данных (с использованием секретного ключа/соли)
    hashToken(token: string, salt: string = ''): string {
        return crypto.createHmac('sha256', salt).update(token).digest('hex');
    }

    // Устанавливает Refresh Token в HTTP-ответ в виде безопасной HttpOnly куки.
    private setRefreshTokenCookie(
        response: Response,
        refreshToken: string,
    ): void {
        const isProduction =
            this.configService.get('ENVIRONMENT') === 'production';
        const refreshExpiresString =
            this.configService.get<string>('JWT_REFRESH_EXPIRES') || '0';
        const refreshExpiresMs = parseInt(refreshExpiresString, 10);

        response.cookie('refreshToken', refreshToken, {
            httpOnly: true, // Защита от XSS-атак
            secure: isProduction, // Только по HTTPS в продакшене
            sameSite: 'strict', // Защита от CSRF-атак
            expires: new Date(Date.now() + refreshExpiresMs),
            path: '/api/v1/auth/refresh', // Должен совпадать с путем установки
        });
    }

    async deleteTokensByHash(refreshToken: string): Promise<number> {
        const hashedToken = this.hashToken(
            refreshToken,
            this.configService.get('JWT_REFRESH_SALT'),
        );

        const deleteResult = await this.prisma.token.deleteMany({
            where: { hashedToken },
        });
        return deleteResult.count;
    }

    async consumeRefreshToken(refreshToken: string): Promise<string> {
        const hashedToken = this.hashToken(
            refreshToken,
            this.configService.get('JWT_REFRESH_SALT'),
        );

        const tokenRecord = await this.prisma.token.findUnique({
            where: { hashedToken },
        });

        if (!tokenRecord) {
            throw new UnauthorizedException(TOKEN_INVALID);
        }

        // Удаляем старый токен (потребляем)
        await this.prisma.token.delete({
            where: { id: tokenRecord.id },
        });

        return tokenRecord.userId;
    }
}
