import { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { BalanceSummary, PurchaseTab, HistoryTab, UsageTab } from '@/components/balance';
// import { mockTransactions } from '@/data/mockTransactions';
import { useApi } from '@/hooks/useApi';
import { useAuth } from '@/context/AuthContext';
import { TOKEN_PARAMS } from '@/constants/tokens-params';
import { BalanceTransactionType, District } from '@monorepo/types';
import { Transaction } from '@monorepo/types';

const Balance = () => {
    const { toast } = useToast();
    const [referralLink, setReferralLink] = useState('https://honor-platform.ru/ref/user123');
    const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
    const { request: requestTransaction } = useApi<Transaction[]>();
    const { loading, error, request } = useApi<District[]>();
    const { refreshUser } = useAuth();
    const [transaction, setTransaction] = useState([]);

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const response = await requestTransaction({
                method: 'GET',
                url: '/api/v1/balance/transactions',
            });

            if (response) {
                setTransaction(response);
            }
        } catch (err) {
            toast({
                title: 'Ошибка',
                description: 'Не удалось загрузить транзакции',
                variant: 'destructive',
            });
        }
    };

    const handleShareReferral = () => {
        navigator.clipboard.writeText(referralLink);
        toast({
            title: 'Ссылка скопирована',
            description: 'Реферальная ссылка скопирована в буфер обмена',
            variant: 'default',
        });
    };

    const handlePurchase = async () => {
        if (!selectedAmount) return;

        try {
            const response = await request({
                method: 'POST',
                url: `/api/v1/balance/deposit`,
                data: { amount: selectedAmount, type: BalanceTransactionType.PURCHASE_TICKETS },
            });

            if (response) {
                await refreshUser();
                await fetchTransactions();
            }

            toast({
                title: 'Оплата успешно прошла',
                description: `Оплата ${selectedAmount} билетов на сумму ${selectedAmount * 10} руб.`,
                variant: 'success',
            });
        } catch (error) {
            toast({
                title: 'Оплата не прошла',
                description: `Оплата ${selectedAmount} билетов на сумму ${selectedAmount * 10} руб.`,
                variant: 'destructive',
            });
        }
    };

    const handleWatchAd = async () => {
        try {
            const response = await request({
                method: 'POST',
                url: `/api/v1/balance/deposit`,
                data: { amount: TOKEN_PARAMS.WATCH_AD_PRICE, type: 'WATCH_AD' },
            });

            if (response) {
                await refreshUser();
                await fetchTransactions();
            }

            toast({
                title: 'Реклама',
                description: 'За просмотр рекламы вы получили 1 билет',
                variant: 'success',
            });
        } catch (error) {
            toast({
                title: 'Реклама',
                description: `Ошибка при просмотре рекламы`,
                variant: 'destructive',
            });
        }
    };

    return (
        <Layout>
            <div className="honor-container py-12">
                <h1 className="text-3xl font-bold mb-8">Баланс билетов</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Balance summary */}
                    <div className="lg:col-span-1">
                        <BalanceSummary
                            referralLink={referralLink}
                            handleShareReferral={handleShareReferral}
                            handleWatchAd={handleWatchAd}
                        />
                    </div>

                    {/* Main content */}
                    <div className="lg:col-span-2">
                        <Tabs defaultValue="purchase">
                            <TabsList className="mb-6 bg-honor-gray">
                                <TabsTrigger
                                    value="purchase"
                                    className="flex-1">
                                    Пополнение
                                </TabsTrigger>
                                <TabsTrigger
                                    value="history"
                                    className="flex-1">
                                    История
                                </TabsTrigger>
                                <TabsTrigger
                                    value="usage"
                                    className="flex-1">
                                    Расходы
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="purchase">
                                <PurchaseTab
                                    selectedAmount={selectedAmount}
                                    setSelectedAmount={setSelectedAmount}
                                    handlePurchase={handlePurchase}
                                    isLoading={loading}
                                />
                            </TabsContent>

                            <TabsContent value="history">
                                <HistoryTab transactions={transaction} />
                            </TabsContent>

                            <TabsContent value="usage">
                                <UsageTab />
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Balance;
