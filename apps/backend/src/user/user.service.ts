import { RegisterRoleEnum, SubscriberUser, SubscriptionUser, TASK_STATUSES, YearTasksData } from '@monorepo/types';
import {
    ConflictException,
    ForbiddenException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Role } from '@prisma/client';
import { RegisterDto } from '@src/auth/dto/register.dto';
import { MailService } from '@src/auth/services/mail.service';
import { TokenSevice } from '@src/auth/services/token.service';
import {
    ACCOUNT_INACTIVE,
    AUTHORIZATION_REQUIRED,
    DEACTIVATE_OWN_ACCOUNT_ONLY,
    EMAIL_NOT_VERIFIED,
    EMAIL_VERIFICATION_FAILED,
    INVALID_CREDENTIALS_MSG,
    USER_DEACTIVATED_SUCCESS,
    USER_NOT_FOUND,
} from '@src/constants/api-messages.constants';
import { logger } from '@src/logger/winston.logger';
import { PrismaService } from '@src/prisma/prisma.service';
import { User, UserResponse, UserWithRepresentativeProfileDto, UserWithVoterProfileDto } from '@src/types/user';
import { fillMissingMonths } from '@src/utils/fillMissingMonths';
import { generateVerificationCode } from '@src/utils/generateVerificationCode';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
    constructor(
        private prisma: PrismaService,
        private mailService: MailService,
        private tokenService: TokenSevice,
        private configService: ConfigService,
    ) {}

    async getAllUsers(): Promise<User[]> {
        try {
            return await this.prisma.user.findMany({
                omit: {
                    password: true, // исключаем password
                },
                orderBy: {
                    name: 'asc',
                },
            });
        } catch (error) {
            logger.error('Failed to find user by email', {
                category: 'database',
                operation: 'getAllUsers',
                error: error instanceof Error ? error.message : error,
            });

            throw error;
        }
    }

    async getUsersByFilter(query: {
        role?: string;
        districtId?: string;
    }): Promise<UserWithRepresentativeProfileDto[] | UserWithVoterProfileDto[]> {
        try {
            const { role, districtId } = query;

            return await this.prisma.user.findMany({
                where: {
                    role: role === 'representative' ? Role.REPRESENTATIVE : Role.VOTER,
                    isActive: true,
                    districtId,
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    isVerified: true,
                    district: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    representativeProfile: {
                        select: {
                            id: true,
                            position: true,
                            party: true,
                            bio: true,
                            rating: true,
                            tasksTotal: true,
                            tasksCompleted: true,
                            attendance: true,
                            lastActivity: true,
                        },
                    },
                    voterProfile: {
                        select: {
                            id: true,
                            userId: true,
                        },
                    },
                },
                orderBy: { name: 'asc' },
            });
        } catch (error) {
            logger.error('Failed to find users', {
                category: 'database',
                operation: 'getUsersByFilter',
                error: error instanceof Error ? error.message : error,
            });

            throw error;
        }
    }

    async getUserByEmail(email: string): Promise<User> {
        try {
            const user = await this.prisma.user.findUnique({
                where: { email },
            });

            if (!user) throw new NotFoundException(USER_NOT_FOUND);

            return user;
        } catch (error) {
            logger.error('Failed to find user by email', {
                category: 'database',
                operation: 'getUserByEmail',
                error: error instanceof Error ? error.message : error,
            });

            throw error;
        }
    }

    async getUserProfile(userId: string): Promise<UserResponse> {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    role: true,
                    isRepresentative: true,
                    isVerified: true,
                    isActive: true,
                    district: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    representativeProfile: {
                        select: {
                            id: true,
                            position: true,
                            party: true,
                            bio: true,
                            rating: true,
                            tasksTotal: true,
                            tasksCompleted: true,
                            attendance: true,
                            lastActivity: true,
                        },
                    },
                    voterProfile: {
                        select: {
                            id: true,
                            balance: true, // Данные профиля может получить только владелец профиля
                        },
                    },
                    subscriptions: {
                        select: {
                            id: true,
                            createdAt: true,
                            representative: {
                                select: {
                                    id: true,
                                    name: true,

                                    representativeProfile: {
                                        select: {
                                            id: true,
                                            position: true,
                                            party: true,
                                            rating: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            });

            if (!user) throw new NotFoundException(USER_NOT_FOUND);

            return user;
        } catch (error) {
            logger.error('Failed to get current user', {
                category: 'database',
                operation: 'getUserProfile',
                error: error instanceof Error ? error.message : error,
            });

            throw error;
        }
    }

    async getUserById(id: string): Promise<UserResponse> {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    role: true,
                    isRepresentative: true,
                    isVerified: true,
                    isActive: true,
                    district: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    representativeProfile: {
                        select: {
                            id: true,
                            position: true,
                            party: true,
                            rating: true,
                            bio: true,
                            tasksTotal: true,
                            tasksCompleted: true,
                            attendance: true,
                            lastActivity: true,
                        },
                    },

                    voterProfile: {
                        select: {
                            id: true,
                            // balance: true, // надо будет ли это? может, не стоит отдавать баланс в этом эндпоинте?
                        },
                    },

                    subscriptions: {
                        select: {
                            id: true,
                            createdAt: true,
                            representative: {
                                select: {
                                    id: true,
                                    name: true,
                                    representativeProfile: {
                                        select: {
                                            id: true,
                                            position: true,
                                            party: true,
                                            rating: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            });

            if (!user) throw new NotFoundException(USER_NOT_FOUND);

            return user;
        } catch (error) {
            logger.error('Failed to find user by id', {
                category: 'database',
                operation: 'getUserById',
                error: error instanceof Error ? error.message : error,
            });

            throw error;
        }
    }

    async verifyUserByToken(token: string): Promise<void> {
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
            throw new NotFoundException(AUTHORIZATION_REQUIRED);
        }

        // 3. Проверяем срок действия
        if (new Date() > tokenRecord.exp) {
            // Удаляем просроченный токен
            await this.prisma.token.delete({
                where: { id: tokenRecord.id },
            });
            throw new NotFoundException(AUTHORIZATION_REQUIRED);
        }

        // 4. Атомарно подтверждаем пользователя и удаляем использованный токен
        try {
            await this.prisma.$transaction([
                this.prisma.user.update({
                    where: { id: tokenRecord.userId },
                    data: { isVerified: true },
                }),
                this.prisma.token.delete({ where: { id: tokenRecord.id } }),
            ]);
        } catch (error) {
            logger.error('Failed to verify user and delete token', {
                category: 'database',
                operation: 'verifyUserByToken',
                error: error instanceof Error ? error.message : error,
            });

            throw error;
        }
    }

    async validateUserLogin(email: string, password: string): Promise<User> {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user || !user.password) {
            throw new ConflictException(INVALID_CREDENTIALS_MSG);
        }

        // Проверка: подтвержден ли email пользователя
        if (!user.isVerified) {
            throw new ConflictException(EMAIL_NOT_VERIFIED);
        }

        // Проверка: активен ли аккаунт пользователя
        if (!user.isActive) {
            throw new ConflictException(ACCOUNT_INACTIVE);
        }

        // Проверка пароля
        const isPasswordValid = await bcrypt.compare(password, user.password as string);

        if (!isPasswordValid) {
            throw new ConflictException(INVALID_CREDENTIALS_MSG);
        }

        return user;
    }

    async createUser(dto: RegisterDto & { isRepresentative: boolean }): Promise<User> {
        const { password, ...userData } = dto;
        const hashedPassword = await bcrypt.hash(password, 10);
        const rawVerifyCode = generateVerificationCode();
        let createdUser: User;

        // 1.  Используем транзакцию, чтобы оба создать пользователя и токен верификации
        try {
            createdUser = await this.prisma.$transaction(async (tx) => {
                const user = await tx.user.create({
                    data: {
                        ...userData,
                        password: hashedPassword,
                        role: dto.role,
                        isRepresentative: dto.isRepresentative,
                    },
                });

                // если это обычный пользователь — создаём VoterProfile
                if (dto.role === RegisterRoleEnum.VOTER) {
                    await tx.voterProfile.create({
                        data: {
                            userId: user.id,
                        },
                    });
                }

                // удаляем старые коды (на всякий случай)
                await tx.token.deleteMany({
                    where: {
                        userId: user.id,
                        type: 'VERIFY_EMAIL',
                    },
                });

                const hashedVerifyCode = this.tokenService.hashToken(
                    rawVerifyCode,
                    this.configService.get('JWT_VERIFY_SALT'),
                );

                const expiryDate = new Date();
                expiryDate.setMinutes(expiryDate.getMinutes() + 5); // ⏱ 5 минут

                // создаем токен верфикации
                await tx.token.create({
                    data: {
                        userId: user.id,
                        type: 'VERIFY_EMAIL',
                        hashedToken: hashedVerifyCode,
                        exp: expiryDate,
                    },
                });

                return user;
            });
        } catch (error) {
            logger.error('CreateUser transaction failed', {
                category: 'database',
                operation: 'createUser',
                error: error instanceof Error ? error.message : error,
            });

            throw error;
        }

        // 2. Отправка Email
        try {
            console.log('отрпавка Email');
            const emailSent = await this.mailService.sendVerificationCode(createdUser.email, rawVerifyCode);

            if (!emailSent) {
                // Если отправка не удалась, инициируем откат через блок catch
                throw new InternalServerErrorException(EMAIL_VERIFICATION_FAILED);
            }
        } catch (error) {
            logger.error('Email verification failed', {
                category: 'email',
                operation: 'createUser',
                error: error instanceof Error ? error.message : error,
            });

            if (createdUser) {
                try {
                    await this.deleteUser(createdUser.id);
                } catch (error) {
                    logger.error('User rollback after email failure failed', {
                        category: 'database',
                        operation: 'createUser',
                        error: error instanceof Error ? error.message : error,
                    });
                }
            }

            throw new InternalServerErrorException(EMAIL_VERIFICATION_FAILED);
        }

        logger.info(`User registered ${createdUser.id}`, {
            category: 'audit',
            operation: 'createUser',
            userId: createdUser.id,
        });

        return createdUser;
    }

    async deleteUser(userId: string): Promise<void> {
        try {
            await this.prisma.user.delete({ where: { id: userId } });
        } catch (error) {
            logger.error(`Failed to delete user ${userId}`, {
                category: 'database',
                operation: 'deleteUser',
                error: error instanceof Error ? error.message : error,
            });

            throw error;
        }

        logger.info(`User delete ${userId}`, {
            category: 'audit',
            operation: 'deleteUser',
            userId: userId,
        });
    }

    async getSubscribers(userId: string): Promise<SubscriberUser[]> {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                include: {
                    subscribers: {
                        include: {
                            subscriber: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    role: true,
                                },
                            },
                        },
                    },
                },
            });

            return user?.subscribers.map((sub) => sub.subscriber) || [];
        } catch (error) {
            logger.error('Failed getting data about subscribers', {
                category: 'database',
                operation: 'getSubscribers',
                error: error instanceof Error ? error.message : error,
            });

            throw error;
        }
    }

    async getSubscriptions(userId: string): Promise<SubscriptionUser[]> {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                include: {
                    subscriptions: {
                        include: {
                            representative: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    role: true,
                                    representativeProfile: {
                                        select: {
                                            position: true,
                                            party: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            });

            return user?.subscriptions.map((sub) => sub.representative) || [];
        } catch (error) {
            logger.error('Failed getting data about subscriptions', {
                category: 'database',
                operation: 'getSubscriptions',
                error: error instanceof Error ? error.message : error,
            });

            throw error;
        }
    }

    async findUserByEmailOrPhone(email: string, phone: string): Promise<User | null> {
        try {
            return await this.prisma.user.findFirst({
                where: {
                    OR: [{ email }, { phone }],
                },
            });
        } catch (error) {
            logger.error('Failed to find user by email or phone', {
                category: 'database',
                operation: 'findUserByEmailOrPhone',
                error: error instanceof Error ? error.message : error,
            });

            return null;
        }
    }

    async deactivateUser(paramId: string, currentUserId: string): Promise<{ message: string }> {
        if (paramId !== currentUserId) {
            throw new ForbiddenException(DEACTIVATE_OWN_ACCOUNT_ONLY);
        }

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
    }

    async getUserStatistics(userId: string): Promise<YearTasksData[]> {
        const raw = await this.prisma.$queryRaw<
            Array<{
                month: Date;
                created: number;
                planned: number;
                inprogress: number;
                completed: number;
                rejected: number;
                comments: number;
                likes: number;
            }>
        >`
            WITH task_stats AS (
            SELECT 
                DATE_TRUNC('month', t."createdAt") as month,
                COUNT(DISTINCT t.id) as created,
                COUNT(DISTINCT t.id) FILTER (WHERE t.status = ${TASK_STATUSES[0]}) as planned,
                COUNT(DISTINCT t.id) FILTER (WHERE t.status = ${TASK_STATUSES[1]}) as inprogress,
                COUNT(DISTINCT t.id) FILTER (WHERE t.status = ${TASK_STATUSES[2]}) as completed,
                COUNT(DISTINCT t.id) FILTER (WHERE t.status = ${TASK_STATUSES[3]}) as rejected

            FROM "tasks" t
            WHERE t."assigneeId" = ${userId}
            GROUP BY month
            ),

            comment_stats AS (
            SELECT 
                DATE_TRUNC('month', c."createdAt") as month,
                COUNT(*) as comments
            FROM "comments" c
            LEFT JOIN "tasks" t ON c."taskId" = t.id
            LEFT JOIN "posts" p ON c."postId" = p.id

            WHERE 
                (
                t."assigneeId" = ${userId}
                OR p."authorId" = ${userId}
                )
                AND c."authorId" != ${userId}

            GROUP BY month
            )

            SELECT 
            COALESCE(ts.month, cs.month) as month,
            COALESCE(ts.created, 0) as created,
            COALESCE(ts.planned, 0) as planned,
            COALESCE(ts.inprogress, 0) as inprogress,
            COALESCE(ts.completed, 0) as completed,
            COALESCE(ts.rejected, 0) as rejected,
            COALESCE(cs.comments, 0) as comments

            FROM task_stats ts
            FULL OUTER JOIN comment_stats cs 
            ON ts.month = cs.month

            ORDER BY month ASC;
        `;

        const monthNames = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

        const formatted = raw.map(
            (item: {
                month: Date;
                created: number;
                planned: number;
                completed: number;
                inprogress: number;
                rejected: number;
                comments: number;
                likes: number;
            }) => {
                const date = new Date(item.month);

                return {
                    year: date.getFullYear(),
                    month: monthNames[date.getMonth()],
                    created: Number(item.created),
                    planned: Number(item.planned),
                    completed: Number(item.completed),
                    inprogress: Number(item.inprogress),
                    rejected: Number(item.rejected),
                    comments: Number(item.comments),
                    likes: Number(item.likes),
                };
            },
        );

        return fillMissingMonths(formatted);
    }
}
