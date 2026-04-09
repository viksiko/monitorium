import { ApiProperty } from '@nestjs/swagger';
import { BalanceTransactionType } from '@prisma/client';
import { IsEnum, IsInt, Max, Min } from 'class-validator';

export class DepositBalanceDto {
    @IsInt({ message: 'Сумма должна быть целым числом' })
    @Min(1, { message: 'Сумма должна быть положительным числом' })
    @Max(999999, { message: 'Сумма не должна превышать 999999' })
    @ApiProperty({ example: '15' })
    amount: number;

    @IsEnum(BalanceTransactionType, { message: 'Указан недопустимый тип транзакции' })
    @ApiProperty({ example: 'PURCHASE_TICKETS' })
    type: BalanceTransactionType;
}
