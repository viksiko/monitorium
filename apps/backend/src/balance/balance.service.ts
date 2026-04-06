import { Balance, UpdateBalance } from '@monorepo/types';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { BalanceTransaction, BalanceTransactionType, Prisma, TransactionDirection } from '@prisma/client';
import { NOT_ENOUGH_FUNDS, VOTER_PROFILE_NOT_FOUND } from '@src/constants/api-messages.constants';
import { logger } from '@src/logger/winston.logger';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BalanceService {
    constructor(private readonly prisma: PrismaService) {}

    async getBalance(userId: string): Promise<Balance> {
        try {
            const profile = await this.prisma.voterProfile.findUnique({
                where: { userId },
                select: { balance: true },
            });

            if (!profile) {
                throw new NotFoundException(VOTER_PROFILE_NOT_FOUND);
            }

            return profile;
        } catch (error) {
            logger.error('Failed to get balance', {
                category: 'BalanceService',
                operation: 'getBalance',
                error: error instanceof Error ? error.message : error,
            });

            throw error;
        }
    }

    // Публичный метод пополнения баланса, используется в контроллере, cам создаёт транзакцию
    async depositBalance(userId: string, amount: number, type: BalanceTransactionType): Promise<UpdateBalance> {
        return this.prisma.$transaction((tx) => this.depositBalanceTx(tx, userId, amount, type));
    }

    // Метод пополнения (для использования внутри транзакций). Например: бонусы, возвраты, промокоды и т.д.
    async depositBalanceTx(
        tx: Prisma.TransactionClient,
        userId: string,
        amount: number,
        type: BalanceTransactionType,
    ): Promise<UpdateBalance> {
        try {
            const profile = await tx.voterProfile.findUnique({
                where: { userId },
            });

            if (!profile) {
                throw new NotFoundException(VOTER_PROFILE_NOT_FOUND);
            }

            const newBalance = profile.balance + amount;

            // 1. обновляем баланс
            const updateBalance = await tx.voterProfile.update({
                where: { userId },
                data: {
                    balance: {
                        increment: amount,
                    },
                },
            });

            // 2. сохраняем транзакцию в базе
            await tx.balanceTransaction.create({
                data: {
                    userId,
                    amount,
                    balanceAfter: newBalance,
                    type,
                    direction: TransactionDirection.CREDIT,
                },
            });

            return updateBalance;
        } catch (error) {
            logger.error('Failed to deposit balance', {
                category: 'BalanceService',
                operation: 'depositBalanceTx',
                error: error instanceof Error ? error.message : error,
            });

            throw error;
        }
    }

    // Публичный метод списания баланса, используется в контроллере (HTTP запрос)
    async withdrawBalance(userId: string, amount: number, type: BalanceTransactionType): Promise<UpdateBalance> {
        return this.prisma.$transaction(async (tx) => {
            return this.withdrawBalanceTx(tx, userId, amount, type);
        });
    }

    // Метод списания (для использования внутри транзакций). Используется, например, при создании задачи
    async withdrawBalanceTx(
        tx: Prisma.TransactionClient,
        userId: string,
        amount: number,
        type: BalanceTransactionType,
    ): Promise<UpdateBalance> {
        try {
            const profile = await tx.voterProfile.findUnique({
                where: { userId },
            });

            if (!profile) {
                throw new NotFoundException(VOTER_PROFILE_NOT_FOUND);
            }

            if (profile.balance < amount) {
                throw new BadRequestException(NOT_ENOUGH_FUNDS);
            }

            const newBalance = profile.balance - amount;

            const updatedProfile = await tx.voterProfile.update({
                where: { userId },
                data: {
                    balance: {
                        decrement: amount,
                    },
                },
            });

            await tx.balanceTransaction.create({
                data: {
                    userId,
                    amount,
                    balanceAfter: newBalance,
                    type,
                    direction: TransactionDirection.DEBIT,
                },
            });

            return updatedProfile;
        } catch (error) {
            logger.error('Failed to withdraw balance', {
                category: 'BalanceService',
                operation: 'withdrawBalanceTx',
                error: error instanceof Error ? error.message : error,
            });

            throw error;
        }
    }

    async getTransactions(userId: string): Promise<BalanceTransaction[]> {
        try {
            return this.prisma.balanceTransaction.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                // take: 7, // для пагинации, если нужно
            });
        } catch (error) {
            logger.error('Failed to get transactions', {
                category: 'BalanceService',
                operation: 'getTransactions',
                error: error instanceof Error ? error.message : error,
            });

            throw error;
        }
    }
}
