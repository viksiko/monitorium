import { UserProfile } from '@monorepo/types';
import {
    ConflictException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
    DB_OPERATION_FAILED,
    LOGOUT_SUCCESS_MSG,
    REFRESH_TOKEN_INVALID,
    REGISTRATION_CONFIRMED_MESSAGE,
    REGISTRATION_SUCCESS,
    USER_ALREADY_EXISTS,
    VERIFICATION_TOKEN_NVALID,
} from '@src/constants/api-messages.constants';
import { UserService } from '@src/user/user.service';
import { Request, Response } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { ForgotPasswordDto } from './dto/forgotPassword.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { CookieTokenService } from './services/cookieToken.service';
import { MailService } from './services/mail.service';
import { TokenSevice } from './services/token.service';

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private prisma: PrismaService,
        private jwtService: JwtService,
        private configService: ConfigService,
        private tokenService: TokenSevice,
        private cookieTokenService: CookieTokenService,
        private mailService: MailService,
    ) {}

    // Регистрация
    async register(registerDto: RegisterDto): Promise<{
        message: string;
    }> {
        try {
            // 1. Проверка существования пользователя (Делегирование UserService)
            const existingUser = await this.userService.findUserByEmailOrPhone(
                registerDto.email,
                registerDto.phone,
            );

            if (existingUser) {
                throw new ConflictException(USER_ALREADY_EXISTS);
            }

            // 2. Создание пользователя
            await this.userService.createUser(registerDto);

            return { message: REGISTRATION_SUCCESS };
        } catch (error) {
            if (error instanceof ConflictException) throw error;

            throw new InternalServerErrorException(DB_OPERATION_FAILED);
        }
    }

    // Авторизация
    async login(
        loginDto: LoginDto,
        response: Response,
    ): Promise<{
        accessToken: string;
        userProfile: UserProfile;
    }> {
        try {
            // 1. Делегируем всю логику поиска, проверки верификации и пароля в UserService
            const user = await this.userService.validateUserLogin(
                loginDto.email,
                loginDto.password,
            );

            // 2. Успешный вход: генерируем payload
            const payload = {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
            };

            return this.tokenService.generateTokens(payload, response);
        } catch (error) {
            if (error instanceof ConflictException) throw error;

            throw new InternalServerErrorException(DB_OPERATION_FAILED);
        }
    }

    // Refresh токен
    async refresh(
        request: Request,
        response: Response,
    ): Promise<{ accessToken: string; userProfile: UserProfile }> {
        try {
            const refreshToken = request.cookies['refreshToken'];

            if (!refreshToken) {
                throw new UnauthorizedException(REFRESH_TOKEN_INVALID);
            }

            // 1. Проверка JWT-подписи токена (Остается в AuthService)
            const verifyJwt = this.jwtService.verify(refreshToken, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
            });

            // 2. Найти и удалить старый токен в БД (Делегируется TokenService)
            await this.tokenService.consumeRefreshToken(refreshToken);

            // 3. Генерируем новую пару токенов (Делегируется TokenService)
            const payload = {
                id: verifyJwt.id,
                name: verifyJwt.name,
                email: verifyJwt.email,
                phone: verifyJwt.phone,
                role: verifyJwt.role,
            };

            return await this.tokenService.generateTokens(payload, response);
        } catch (error) {
            if (error instanceof UnauthorizedException) throw error;

            throw new InternalServerErrorException(DB_OPERATION_FAILED);
        }
    }

    // Выход из системы
    async logout(
        request: Request,
        response: Response,
    ): Promise<{
        message: string;
    }> {
        const refreshToken = request.cookies['refreshToken'];

        if (!refreshToken) {
            throw new UnauthorizedException(REFRESH_TOKEN_INVALID);
        }

        try {
            const deletedCount =
                await this.tokenService.deleteTokensByHash(refreshToken);

            if (deletedCount === 0) {
                throw new UnauthorizedException(REFRESH_TOKEN_INVALID);
            }

            this.cookieTokenService.clearRefreshTokenCookie(response);

            return { message: LOGOUT_SUCCESS_MSG };
        } catch (error) {
            if (error instanceof UnauthorizedException) throw error;

            throw new InternalServerErrorException(DB_OPERATION_FAILED);
        }
    }

    // подтверждение регистрации
    async confirmRegistration(token: string): Promise<{ message: string }> {
        if (!token) {
            throw new NotFoundException(VERIFICATION_TOKEN_NVALID);
        }

        try {
            await this.userService.verifyUserByToken(token);
        } catch (error) {
            if (error instanceof NotFoundException) throw error;

            throw new InternalServerErrorException(DB_OPERATION_FAILED);
        }

        return { message: REGISTRATION_CONFIRMED_MESSAGE };
    }

    // запрос на восстановление пароля
    async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
        const user = await this.userService.findUserByEmail(dto.email);

        // Если юзера нет, мы не кидаем ошибку, а просто имитируем успех
        if (!user) {
            return {
                message:
                    'Если адрес указан верно, письмо придет в течение нескольких минут',
            };
        }

        const rawResetToken = uuidv4();
        const salt = this.configService.get('JWT_RESET_PASSWORD_SALT');
        const hashedResetToken = this.tokenService.hashToken(
            rawResetToken,
            salt,
        );

        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() + 1); // Токены сброса обычно живут недолго (1 час)

        try {
            await this.prisma.$transaction(async (tx) => {
                // Удаляем старые токены сброса пароля этого пользователя (чтобы не копились)
                await tx.token.deleteMany({
                    where: { userId: user.id, type: 'RESET_PASSWORD' },
                });

                // Создаем новый
                await tx.token.create({
                    data: {
                        userId: user.id,
                        type: 'RESET_PASSWORD',
                        hashedToken: hashedResetToken,
                        exp: expiryDate,
                    },
                });
            });

            // Отправка письма (вне транзакции!)
            await this.mailService.sendResetPasswordEmail(
                user.email,
                rawResetToken,
            );
        } catch (error) {
            console.error('Forgot password error:', error);
            // Тут можно выбросить ошибку, так как это технический сбой
            throw new InternalServerErrorException(DB_OPERATION_FAILED);
        }

        return { message: 'Инструкции по сбросу пароля отправлены на почту' };
    }

    // async resetPassword(dto: ResetPasswordDto) {
    //     const { token, newPassword } = dto;

    //     // 1. Хешируем входящий токен для поиска
    //     const salt = this.configService.get('JWT_RESET_PASSWORD_SALT');
    //     const hashedInput = this.tokenService.hashToken(token, salt);

    //     // 2. Ищем токен
    //     const tokenRecord = await this.prisma.token.findUnique({
    //         where: { hashedToken: hashedInput },
    //     });

    //     if (!tokenRecord || tokenRecord.type !== 'RESET_PASSWORD') {
    //         throw new BadRequestException('Неверный или просроченный токен');
    //     }

    //     // 3. Проверка срока действия
    //     if (new Date() > tokenRecord.exp) {
    //         await this.prisma.token.delete({ where: { id: tokenRecord.id } });
    //         throw new BadRequestException('Срок действия токена истек');
    //     }

    //     // 4. Хешируем новый пароль
    //     const hashedPassword = await bcrypt.hash(newPassword, 10);

    //     // 5. Обновляем пароль и удаляем токен (транзакция)
    //     try {
    //         await this.prisma.$transaction([
    //             this.prisma.user.update({
    //                 where: { id: tokenRecord.userId },
    //                 data: { password: hashedPassword },
    //             }),
    //             this.prisma.token.delete({
    //                 where: { id: tokenRecord.id },
    //             }),
    //         ]);
    //     } catch (error) {
    //         throw new InternalServerErrorException(
    //             'Не удалось сбросить пароль',
    //         );
    //     }

    //     return { message: 'Пароль успешно изменен' };
    // }
}
