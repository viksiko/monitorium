import { UserProfile } from '@monorepo/types';
import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
    AUTHORIZATION_REQUIRED,
    LOGOUT_SUCCESS_MSG,
    MAIL_DELIVERY_MESSAGE,
    REGISTRATION_CONFIRMED_MESSAGE,
    REPRESENTATIVE_REQUEST_CREATED,
    USER_ALREADY_EXISTS,
    USER_NOT_FOUND_MSG,
    VERIFICATION_MESSAGES,
} from '@src/constants/api-messages.constants';
import { logger } from '@src/logger/winston.logger';
import { User } from '@src/types/user';
import { UserService } from '@src/user/user.service';
import * as bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { СonfirmRegistration } from './dto/confirmRegistration';
import { ForgotPasswordDto } from './dto/forgotPassword.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RepresentativeRequestDto } from './dto/representativeRequest.dto';
import { ResetPasswordDto } from './dto/resetPassword.dto';
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
    async register(
        registerDto: RegisterDto,
        // isRepresentative: boolean,
    ): Promise<User> {
        // 1. Проверка существования пользователя
        const existingUser = await this.userService.findUserByEmailOrPhone(registerDto.email, registerDto.phone);

        if (existingUser) {
            throw new ConflictException(USER_ALREADY_EXISTS);
        }

        // 2. Создание пользователя
        const user = await this.userService.createUser({
            ...registerDto,
            isRepresentative: registerDto.role === 'REPRESENTATIVE',
        });

        return user;
    }

    // Авторизация
    async login(
        loginDto: LoginDto,
        response: Response,
    ): Promise<{
        accessToken: string;
        userProfile: UserProfile;
    }> {
        // 1. Делегируем всю логику поиска, проверки верификации и пароля в UserService
        const user = await this.userService.validateUserLogin(loginDto.email, loginDto.password);

        // 2. Успешный вход: генерируем payload
        const payload = {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            isRepresentative: user.isRepresentative,
        };

        return this.tokenService.generateTokens(payload, response);
    }

    // Refresh токен
    async refresh(request: Request, response: Response): Promise<{ accessToken: string; userProfile: UserProfile }> {
        const refreshToken = request.cookies['refreshToken'];

        if (!refreshToken) {
            throw new UnauthorizedException(AUTHORIZATION_REQUIRED);
        }

        // 1. Проверка JWT-подписи токена (Остается в AuthService)
        let verifyJwt;
        try {
            verifyJwt = this.jwtService.verify(refreshToken, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
            });
        } catch (error) {
            logger.warn('VerifyJwt failed', {
                category: 'token',
                operation: 'refresh',
                error: error instanceof Error ? error.message : error,
            });
            throw new UnauthorizedException(AUTHORIZATION_REQUIRED);
        }
        // 2. Найти и удалить старый токен в БД (Делегируется TokenService)
        await this.tokenService.consumeRefreshToken(refreshToken);

        // 3. Генерируем новую пару токенов (Делегируется TokenService)
        const payload = {
            id: verifyJwt.id,
            name: verifyJwt.name,
            email: verifyJwt.email,
            phone: verifyJwt.phone,
            role: verifyJwt.role,
            isRepresentative: verifyJwt.isRepresentative,
        };

        return await this.tokenService.generateTokens(payload, response);
    }

    // Выход из системы
    async logout(request: Request, response: Response): Promise<{ message: string }> {
        const refreshToken = request.cookies['refreshToken'];

        if (refreshToken) {
            await this.tokenService.deleteTokensByHash(refreshToken);
        }

        this.cookieTokenService.clearRefreshTokenCookie(response);

        return { message: LOGOUT_SUCCESS_MSG };
    }

    // старый способ подтверждение регистрации
    // async confirmRegistration(token: string): Promise<{ message: string }> {
    //     if (!token) {
    //         throw new UnauthorizedException(AUTHORIZATION_REQUIRED);
    //     }

    //     await this.userService.verifyUserByToken(token);

    //     return { message: REGISTRATION_CONFIRMED_MESSAGE };
    // }

    // запрос на восстановление пароля
    async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
        const user = await this.userService.findUserByEmail(dto.email);

        // Если юзера нет, мы не кидаем ошибку, а просто имитируем успех
        if (!user) {
            return { message: MAIL_DELIVERY_MESSAGE };
        }

        const rawResetToken = uuidv4();
        const salt = this.configService.get('JWT_RESET_PASSWORD_SALT');
        const hashedResetToken = this.tokenService.hashToken(rawResetToken, salt);

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
            await this.mailService.sendResetPasswordEmail(user.email, rawResetToken);
        } catch (error) {
            logger.error('Failed to create reset password token', {
                category: 'database',
                operation: 'forgotPassword',
                error: error instanceof Error ? error.message : error,
            });
            throw error;
        }

        return { message: MAIL_DELIVERY_MESSAGE };
    }

    // запрос на изменение пароля
    async resetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
    }> {
        const { token, password } = dto;

        // 1. Хешируем входящий токен для поиска
        const salt = this.configService.get('JWT_RESET_PASSWORD_SALT');
        const hashedInput = this.tokenService.hashToken(token, salt);

        // 2. Ищем reset_password токен
        const tokenRecord = await this.prisma.token.findUnique({
            where: { hashedToken: hashedInput },
        });

        if (!tokenRecord || tokenRecord.type !== 'RESET_PASSWORD') {
            throw new UnauthorizedException(AUTHORIZATION_REQUIRED);
        }

        // 3. Проверка срока действия
        if (new Date() > tokenRecord.exp) {
            await this.prisma.token.delete({ where: { id: tokenRecord.id } });
            throw new UnauthorizedException(AUTHORIZATION_REQUIRED);
        }

        // 4. Хешируем новый пароль
        const hashedPassword = await bcrypt.hash(password, 10);

        // 5. Обновляем пароль и удаляем токены reset_password и все refresh пользователя
        try {
            await this.prisma.$transaction([
                this.prisma.user.update({
                    where: { id: tokenRecord.userId },
                    data: { password: hashedPassword },
                }),

                this.prisma.token.delete({
                    where: { id: tokenRecord.id },
                }),

                this.prisma.token.deleteMany({
                    where: {
                        userId: tokenRecord.userId,
                        type: 'REFRESH',
                    },
                }),
            ]);
        } catch (error) {
            logger.error('Failed to create reset password token', {
                category: 'database',
                operation: 'resetPassword',
                error: error instanceof Error ? error.message : error,
            });
            throw error;
        }

        return { message: 'Пароль успешно изменен' };
    }

    async confirmRegistration(dto: СonfirmRegistration): Promise<{
        message: string;
    }> {
        const { userId, code } = dto;

        try {
            const token = await this.prisma.token.findFirst({
                where: { userId, type: 'VERIFY_EMAIL' },
            });

            if (!token) throw new BadRequestException(VERIFICATION_MESSAGES.CODE_NOT_FOUND);

            if (token.exp < new Date()) throw new BadRequestException(VERIFICATION_MESSAGES.CODE_EXPIRED);

            const hashed = this.tokenService.hashToken(code, this.configService.get('JWT_VERIFY_SALT'));
            if (hashed !== token.hashedToken) throw new BadRequestException(VERIFICATION_MESSAGES.CODE_INVALID);

            const user = await this.prisma.user.findUnique({
                where: { id: userId },
            });
            if (!user) throw new NotFoundException(USER_NOT_FOUND_MSG);

            await this.prisma.$transaction(async (tx) => {
                const updatedUser = await tx.user.update({
                    where: { id: userId },
                    data: { isVerified: true },
                });

                return updatedUser;
            });
            return { message: REGISTRATION_CONFIRMED_MESSAGE };
        } catch (error) {
            logger.error('Failed to verify user code', {
                operation: 'verifyCode',
                userId,
                error: error instanceof Error ? error.message : error,
            });
            throw error;
        }
    }

    async representativeRequest(dto: RepresentativeRequestDto): Promise<{ message: string }> {
        const { userId, position } = dto;

        try {
            // Проверяем, что пользователь существует
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
            });

            if (!user) {
                throw new NotFoundException(USER_NOT_FOUND_MSG);
            }

            // Обновляем пользователя + создаём профиль представителя в транзакции
            await this.prisma.$transaction(async (tx) => {
                await tx.user.update({
                    where: { id: userId },
                    data: {
                        isRepresentative: true,
                        isVerified: true, // TODO: убрать, верификация будет делаться по другому
                    },
                });

                await tx.representativeProfile.create({
                    data: {
                        userId,
                        position: dto.position,
                        party: dto.party,
                        bio: dto.bio,
                    },
                });
            });

            return { message: REPRESENTATIVE_REQUEST_CREATED };
        } catch (error) {
            logger.error('Failed to create representative request', {
                category: 'UserService',
                operation: 'representativeRequest',
                userId,
                position,
                error: error instanceof Error ? error.message : error,
            });

            throw error;
        }
    }
}
