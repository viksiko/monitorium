import { ApiProperty } from '@nestjs/swagger';
import { BalanceTransactionType } from '@prisma/client';
import { IsEnum, IsInt, Min } from 'class-validator';

export class WithdrawBalanceDto {
    @IsInt({ message: 'Сумма должна быть целым числом' })
    @Min(1, { message: 'Сумма должна быть положительным числом' })
    @ApiProperty({ example: '15' })
    amount: number;

    @IsEnum(BalanceTransactionType, { message: 'Указан недопустимый тип транзакции' })
    @ApiProperty({ example: 'CREATE_TASK' })
    type: BalanceTransactionType;
}
