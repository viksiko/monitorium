import { Card } from '@/components/ui/card';
import { Wallet, ArrowUp, ArrowDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Transaction } from '@monorepo/types';
import { TransactionDirection } from '@monorepo/types';
import { BalanceTransactionType } from '@monorepo/types';
import { useState } from 'react';

interface HistoryTabProps {
    transactions: Transaction[];
}

const HistoryTab: React.FC<HistoryTabProps> = ({ transactions }) => {
    const [showAll, setShowAll] = useState(false);
    const displayedTransactions = showAll ? transactions : transactions.slice(0, 7);

    return (
        <Card className="honor-card mb-6">
            <div className="p-6">
                <h2 className="text-xl font-bold mb-4">История транзакций</h2>

                <div className="flex justify-between mb-6">
                    <div className="text-center">
                        <p className="text-left text-sm text-honor-darkGray">Всего получено</p>
                        <p className="text-xl font-bold text-honor-blue">
                            {transactions
                                .filter((t) => t.direction === TransactionDirection.CREDIT)
                                .reduce((sum, t) => sum + t.amount, 0)}{' '}
                            билетов
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-right text-sm text-honor-darkGray">Всего потрачено</p>
                        <p className="text-xl font-bold text-honor-darkGray">
                            {Math.abs(
                                transactions
                                    .filter((t) => t.direction === TransactionDirection.DEBIT)
                                    .reduce((sum, t) => sum + t.amount, 0),
                            )}{' '}
                            билетов
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    {displayedTransactions.map((transaction) => (
                        <div
                            key={transaction.id}
                            className="flex items-center justify-between border-b pb-4">
                            <div className="flex items-center">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                        transaction.direction === TransactionDirection.CREDIT
                                            ? 'bg-green-100'
                                            : 'bg-red-100'
                                    }`}>
                                    {transaction.direction === TransactionDirection.CREDIT ? (
                                        <ArrowUp
                                            size={18}
                                            className="text-green-600"
                                        />
                                    ) : (
                                        <ArrowDown
                                            size={18}
                                            className="text-red-600"
                                        />
                                    )}
                                </div>
                                <div className="ml-4">
                                    {
                                        {
                                            [BalanceTransactionType.REGISTRATION_BONUS]: 'Бонус за регистрацию',
                                            [BalanceTransactionType.WATCH_AD]: 'За просмотр рекламы',
                                            [BalanceTransactionType.CREATE_TASK]: 'Создание задания',
                                            [BalanceTransactionType.MESSAGE_REPRESENTATIVE]: 'Отправка сообщения',
                                            [BalanceTransactionType.PURCHASE_TICKETS]: 'Покупка билетов',
                                            [BalanceTransactionType.REPRESENTATIVE_SUBSCRIPTION]:
                                                'Подписка на представителя',
                                        }[transaction.type]
                                    }
                                    <p className="text-xs text-honor-darkGray">
                                        {new Date(transaction.createdAt).toLocaleDateString('ru-RU')}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <Badge
                                    className={
                                        transaction.direction === TransactionDirection.CREDIT
                                            ? 'bg-green-100 text-green-800 border-green-200'
                                            : 'bg-red-100 text-red-800 border-red-200'
                                    }>
                                    {transaction.direction === TransactionDirection.CREDIT ? '+' : '-'}
                                    {transaction.amount} билетов
                                </Badge>
                            </div>
                        </div>
                    ))}
                </div>

                {transactions.length > 7 && !showAll && (
                    <div className="text-center mt-6">
                        <button
                            onClick={() => setShowAll(true)}
                            className="px-6 py-2 text-sm font-medium text-honor-blue border border-honor-blue rounded-lg hover:bg-honor-blue hover:text-white transition-colors">
                            Показать все ({transactions.length - 7} осталось)
                        </button>
                    </div>
                )}

                {showAll && transactions.length > 7 && (
                    <div className="text-center mt-6">
                        <button
                            onClick={() => setShowAll(false)}
                            className="px-6 py-2 text-sm font-medium text-honor-darkGray border border-honor-darkGray rounded-lg hover:bg-honor-darkGray hover:text-white transition-colors">
                            Свернуть
                        </button>
                    </div>
                )}

                {transactions.length === 0 && (
                    <div className="text-center py-10">
                        <Wallet
                            size={48}
                            className="mx-auto text-honor-darkGray opacity-30 mb-4"
                        />
                        <p className="text-honor-darkGray">У вас пока нет транзакций</p>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default HistoryTab;
