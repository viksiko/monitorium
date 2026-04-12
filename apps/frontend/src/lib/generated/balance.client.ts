/**
 * HTTP-клиент для BalanceController
 * @generated
 */

import { customInstance } from '@/lib/mutator';
import type { DepositBalanceDtoModel, WithdrawBalanceDtoModel } from './models/index';
import type { Balance, UpdateBalance } from '@monorepo/types';

export const balance = {
    getBalance: async () => {
        return customInstance<Balance>({
            url: `/api/v1/balance`,
            method: 'GET',
        });
    },
    depositBalance: async (dto: DepositBalanceDtoModel) => {
        return customInstance<UpdateBalance>({
            url: `/api/v1/balance/deposit`,
            method: 'POST',
            data: dto,
        });
    },
    withdrawBalance: async (dto: WithdrawBalanceDtoModel) => {
        return customInstance<UpdateBalance>({
            url: `/api/v1/balance/withdraw`,
            method: 'POST',
            data: dto,
        });
    },
    getTransactions: async () => {
        return customInstance<BalanceTransaction[]>({
            url: `/api/v1/balance/transactions`,
            method: 'GET',
        });
    },
} as const;
