import { Balance, UpdateBalance } from '@monorepo/types';
import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BalanceTransaction, User } from '@prisma/client';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { HEADERS_AUTHORIZATION } from '@src/constants/swagger/api-headers.swagger';
import {
    DEPOSIT_BALANCE_VALIDATION_ERROR_RESPONSE,
    GET_BALANCE_RESPONSE,
    GET_TRANSACTIONS_RESPONSE,
    UPDATE_BALANCE_RESPONSE,
    WITHDRAW_BALANCE_INSUFFICIENT_FUNDS_RESPONSE,
} from '@src/constants/swagger/balance-responese';
import {
    AUTHENTICATION_ERROR_RESPONSES,
    DATABASE_ERROR_RESPONSE,
} from '@src/constants/swagger/shared-responses.swagger';
import { Request } from 'express';
import { BalanceService } from './balance.service';
import { DepositBalanceDto } from './dto/deposit-balance.dto';
import { WithdrawBalanceDto } from './dto/withdraw-balance.dto';

@UseGuards(JwtAuthGuard)
@ApiHeader(HEADERS_AUTHORIZATION)
@ApiResponse(AUTHENTICATION_ERROR_RESPONSES)
@ApiResponse(DATABASE_ERROR_RESPONSE)
@Controller({
    path: 'balance',
    version: '1',
})
@Controller('balance')
export class BalanceController {
    constructor(private readonly balanceService: BalanceService) {}

    // Получить баланс
    @Get()
    @ApiOperation({ summary: 'Получить баланс' })
    @ApiResponse(GET_BALANCE_RESPONSE)
    async getBalance(@Req() req: Request & { user: User }): Promise<Balance> {
        const userId = req.user.id;
        return this.balanceService.getBalance(userId);
    }

    // Пополнение баланса
    @Post('deposit')
    @ApiOperation({ summary: 'Пополнить баланс' })
    @ApiResponse(UPDATE_BALANCE_RESPONSE)
    @ApiResponse(DEPOSIT_BALANCE_VALIDATION_ERROR_RESPONSE)
    async depositBalance(@Req() req: Request & { user: User }, @Body() dto: DepositBalanceDto): Promise<UpdateBalance> {
        const userId = req.user.id;
        return this.balanceService.depositBalance(userId, dto.amount, dto.type);
    }

    // Списание баланса
    @Post('withdraw')
    @ApiOperation({ summary: 'Списать с баланса' })
    @ApiResponse(UPDATE_BALANCE_RESPONSE)
    @ApiResponse(WITHDRAW_BALANCE_INSUFFICIENT_FUNDS_RESPONSE)
    async withdrawBalance(
        @Req() req: Request & { user: User },
        @Body() dto: WithdrawBalanceDto,
    ): Promise<UpdateBalance> {
        const userId = req.user.id;
        return this.balanceService.withdrawBalance(userId, dto.amount, dto.type);
    }

    // История транзанкций
    @Get('transactions')
    @ApiOperation({ summary: 'Получить история транзанкций' })
    @ApiResponse(GET_TRANSACTIONS_RESPONSE)
    async getTransactions(@Req() req: Request & { user: User }): Promise<BalanceTransaction[]> {
        const userId = req.user.id;
        return this.balanceService.getTransactions(userId);
    }
}
