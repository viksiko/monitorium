import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

@Injectable()
export class CookieTokenService {
    constructor(private configService: ConfigService) {}

    // Устанавливает Refresh Token в HTTP-ответ в виде безопасной HttpOnly куки.
    setRefreshTokenCookie(response: Response, refreshToken: string): void {
        const isProduction =
            this.configService.get('ENVIRONMENT') === 'production';

        response.cookie('refreshToken', refreshToken, {
            httpOnly: true, // защита от XSS
            secure: isProduction, // true в проде (HTTPS)
            sameSite: 'strict', // защита от CSRF
            maxAge: 5 * 60 * 1000, // 30 дней
            path: '/', // Должен совпадать с путем установки
        });

        // const refreshExpiresString =
        //     this.configService.get<string>('JWT_REFRESH_EXPIRES') || '0';
        // const refreshExpiresMs = parseInt(refreshExpiresString, 10);

        //   response.cookie('testCookie2', refreshToken, {
        //         httpOnly: true, // JS не видит, безопасно
        //         secure: false, // DEV: http, true для prod + HTTPS
        //         sameSite: 'lax', // Lax для SPA
        //         maxAge: 24 * 60 * 60 * 1000, // 1 день
        //         path: '/', // Важно: отправляется на все пути
        //     });
    }

    // очистка Refresh Token в HTTP-ответ в виде безопасной HttpOnly куки.
    clearRefreshTokenCookie(response: Response): void {
        const isProduction =
            this.configService.get('ENVIRONMENT') === 'production';

        response.clearCookie('refreshToken', {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'strict',
            path: '/',
        });
    }
}
