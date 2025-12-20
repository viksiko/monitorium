import {
    ConflictException,
    ForbiddenException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RegisterDto } from '@src/auth/dto/register.dto';
import { MailService } from '@src/auth/services/mail.service';
import { TokenSevice } from '@src/auth/services/token.service';
import {
    DB_OPERATION_FAILED,
    DEACTIVATE_OWN_ACCOUNT_ONLY,
    EMAIL_NOT_VERIFIED,
    EMAIL_VERIFICATION_FAILED,
    INVALID_CREDENTIALS_MSG,
    USER_DEACTIVATED_SUCCESS,
    VERIFICATION_TOKEN_NVALID,
} from '@src/constants/api-messages.constants';
import { PrismaService } from '@src/prisma/prisma.service';
import { User, UserResponse } from '@src/types/user';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UserService {
    constructor(
        private prisma: PrismaService,
        private mailService: MailService,
        private tokenService: TokenSevice,
        private configService: ConfigService,
    ) {}
    async getAllUsers(): Promise<UserResponse[]> {
        try {
            return await this.prisma.user.findMany({
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            });
        } catch (error) {
            // Логирование фактической ошибки (Надо настроить логер)
            console.error('Ошибка getAllUsers:', error);

            throw new InternalServerErrorException(DB_OPERATION_FAILED);
        }
    }

    async findUserById(id: string): Promise<User | null> {
        try {
            return (
                (await this.prisma.user.findUnique({ where: { id } })) || null
            );
        } catch (error) {
            // Логирование фактической ошибки (Надо настроить логер)
            console.error('Ошибка findUserById:', error);

            throw new InternalServerErrorException(DB_OPERATION_FAILED);
        }
    }

    async findUserByEmail(email: string): Promise<User | null> {
        try {
            return (
                (await this.prisma.user.findUnique({
                    where: { email },
                })) || null
            );
        } catch (error) {
            // Логирование фактической ошибки (Надо настроить логер)
            console.error('Ошибка findUserByEmail:', error);

            throw new InternalServerErrorException(DB_OPERATION_FAILED);
        }
    }

    async verifyUserByToken(token: string): Promise<void> {
        try {
            // 1. Хешируем входящий "сырой" токен тем же способом, что и при создании
            const salt = this.configService.get('JWT_VERIFY_SALT');
            const hashedToken = this.tokenService.hashToken(token, salt);

            // 2. Ищем токен в БД. Используем findUnique, если поле hashedToken помечено как @unique
            const tokenRecord = await this.prisma.token.findUnique({
                where: {
                    hashedToken: hashedToken,
                },
            });

            // Если токен не найден или это не токен верификации
            if (!tokenRecord || tokenRecord.type !== 'VERIFY_EMAIL') {
                throw new NotFoundException(VERIFICATION_TOKEN_NVALID);
            }

            // 3. Проверяем срок действия
            if (new Date() > tokenRecord.exp) {
                // Удаляем просроченный токен
                await this.prisma.token.delete({
                    where: { id: tokenRecord.id },
                });
                throw new NotFoundException(VERIFICATION_TOKEN_NVALID);
            }

            // 4. Атомарно подтверждаем пользователя и удаляем использованный токен
            await this.prisma.$transaction([
                this.prisma.user.update({
                    where: { id: tokenRecord.userId },
                    data: { isVerified: true },
                }),
                this.prisma.token.delete({
                    where: { id: tokenRecord.id },
                }),
            ]);
        } catch (error) {
            if (error instanceof NotFoundException) throw error;

            throw new InternalServerErrorException(DB_OPERATION_FAILED);
        }
    }

    async validateUserLogin(email: string, password: string): Promise<User> {
        try {
            const user = await this.prisma.user.findUnique({
                where: { email },
            });

            if (!user || !user.password) {
                throw new ConflictException(INVALID_CREDENTIALS_MSG);
            }

            if (!user.isVerified) {
                throw new ConflictException(EMAIL_NOT_VERIFIED);
            }

            // Проверка пароля
            const isPasswordValid = await bcrypt.compare(
                password,
                user.password as string,
            );

            if (!isPasswordValid) {
                throw new ConflictException(INVALID_CREDENTIALS_MSG);
            }

            return user;
        } catch (error) {
            if (error instanceof ConflictException) throw error;

            throw new InternalServerErrorException(DB_OPERATION_FAILED);
        }
    }

    async createUser(dto: RegisterDto): Promise<User> {
        const { password, ...userData } = dto;
        const hashedPassword = await bcrypt.hash(password, 10);
        const rawVerifyToken = uuidv4();
        let createdUser: User;

        // 1.  Используем транзакцию, чтобы оба создать пользователя и токен верификации
        try {
            createdUser = await this.prisma.$transaction(async (tx) => {
                const user = await tx.user.create({
                    data: {
                        ...userData,
                        password: hashedPassword,
                    },
                });

                const hashedVerifyToken = this.tokenService.hashToken(
                    rawVerifyToken,
                    this.configService.get('JWT_VERIFY_SALT'),
                );

                const expiryDate = new Date();
                expiryDate.setHours(expiryDate.getHours() + 24);

                // создаем токен верфикации
                await tx.token.create({
                    data: {
                        userId: user.id,
                        type: 'VERIFY_EMAIL',
                        hashedToken: hashedVerifyToken,
                        exp: expiryDate,
                    },
                });

                return user;
            });
        } catch (error) {
            // Логирование фактической ошибки (Надо настроить логер)
            console.error('Ошибка createUser:', error);

            throw new InternalServerErrorException(DB_OPERATION_FAILED);
        }

        // 2. Отправка Email
        try {
            const emailSent = await this.mailService.sendVerificationEmail(
                createdUser.email,
                rawVerifyToken,
            );

            if (!emailSent) {
                // Если отправка не удалась, инициируем откат через блок catch
                throw new Error(EMAIL_VERIFICATION_FAILED);
            }
        } catch (error) {
            // Логирование фактической ошибки (Надо настроить логер)
            console.error('Ошибка createUser:', error);

            if (createdUser) {
                try {
                    await this.deleteUser(createdUser.id);
                } catch (error) {
                    // Логирование фактической ошибки (Надо настроить логер)
                    console.error('Ошибка createUser:', error);
                }
            }

            throw new InternalServerErrorException(EMAIL_VERIFICATION_FAILED);
        }

        return createdUser;
    }

    async deleteUser(userId: string): Promise<void> {
        try {
            await this.prisma.user.delete({ where: { id: userId } });
        } catch (error) {
            // Логирование фактической ошибки (Надо настроить логер)
            console.error('Ошибка deleteUser:', error);

            throw new InternalServerErrorException(DB_OPERATION_FAILED);
        }
    }

    async findUserByEmailOrPhone(
        email: string,
        phone: string,
    ): Promise<User | null> {
        try {
            return await this.prisma.user.findFirst({
                where: {
                    OR: [{ email }, { phone }],
                },
            });
        } catch (error) {
            // Логирование фактической ошибки (Надо настроить логер)
            console.error('Ошибка deleteUser:', error);

            throw new InternalServerErrorException(DB_OPERATION_FAILED);
        }
    }

    async deactivateUser(
        paramId: string,
        currentUserId: string,
    ): Promise<{ message: string }> {
        if (paramId !== currentUserId) {
            throw new ForbiddenException(DEACTIVATE_OWN_ACCOUNT_ONLY);
        }

        try {
            // 1. Деактивация пользователя (Soft Delete)
            const userUpdate = this.prisma.user.update({
                where: { id: paramId },
                data: {
                    isActive: false,
                    deletedAt: new Date(),
                },
            });

            // 2. Удаление всех токенов пользователя
            const tokensDelete = this.prisma.token.deleteMany({
                where: { userId: paramId },
            });

            // 3. Выполнение обеих операций параллельно
            await this.prisma.$transaction([userUpdate, tokensDelete]);

            return { message: USER_DEACTIVATED_SUCCESS };
        } catch (error) {
            if (error instanceof ForbiddenException) throw error;

            throw new InternalServerErrorException(DB_OPERATION_FAILED);
        }
    }
}
