import * as crypto from 'crypto';
import { UserProfile } from '@monorepo/types';
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import { AUTHORIZATION_REQUIRED } from '@src/constants/api-messages.constants';
import { logger } from '@src/logger/winston.logger';
import { PrismaService } from '@src/prisma/prisma.service';
import { JwtPayload } from '@src/types/auth';
import { Response } from 'express';
import { CookieTokenService } from './cookieToken.service';

@Injectable()
export class TokenSevice {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private configService: ConfigService,
        private cookieTokenService: CookieTokenService,
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

        this.cookieTokenService.setRefreshTokenCookie(response, refreshToken);

        return {
            accessToken,
            userProfile: {
                name: payload.name,
                email: payload.email,
                phone: payload.phone || '',
                role: payload.role,
                isRepresentative: payload.isRepresentative,
            },
        };
    }

    // Сохранение refresh токена в базу
    private async saveRefreshToken(userId: string, refreshToken: string, expiresAt: Date): Promise<void> {
        const hashed = this.hashToken(refreshToken, this.configService.get('JWT_REFRESH_SALT'));

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

    async deleteTokensByHash(refreshToken: string): Promise<number> {
        const hashedToken = this.hashToken(refreshToken, this.configService.get('JWT_REFRESH_SALT'));

        const deleteResult = await this.prisma.token.deleteMany({
            where: { hashedToken },
        });
        return deleteResult.count;
    }

    // Хеширует входящий токен и ищет его в базе
    async consumeRefreshToken(refreshToken: string): Promise<string> {
        const hashedToken = this.hashToken(refreshToken, this.configService.get('JWT_REFRESH_SALT'));

        const tokenRecord = await this.prisma.token.findUnique({
            where: { hashedToken },
        });

        if (!tokenRecord) {
            throw new UnauthorizedException(AUTHORIZATION_REQUIRED);
        }

        // Удаляем старый токен
        await this.prisma.token.delete({
            where: { id: tokenRecord.id },
        });

        return tokenRecord.userId;
    }

    // Удаление токена, например при подтверждении регистрации
    async deleteTokenById(tx: Prisma.TransactionClient, tokenId: string): Promise<void> {
        const deleted = await tx.token.deleteMany({
            where: { id: tokenId },
        });

        if (deleted.count === 0) {
            throw new NotFoundException(`Token with id ${tokenId} not found`);
        }
    }
}
