import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Wallet, Share2, Award, CheckCircle, ThumbsUp, MessageSquare, User, Clock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';

interface BalanceSummaryProps {
    referralLink: string;
    handleShareReferral: () => void;
    handleWatchAd: () => void;
}

const BalanceSummary: React.FC<BalanceSummaryProps> = ({ referralLink, handleShareReferral, handleWatchAd }) => {
    const { user } = useAuth();

    return (
        <Card className="honor-card mb-6">
            <div className="flex flex-col items-center p-6">
                <div className="bg-honor-blue/10 p-4 rounded-full mb-4">
                    <Wallet
                        size={32}
                        className="text-honor-blue"
                    />
                </div>
                <h2 className="text-2xl font-bold">Текущий баланс</h2>
                <p className="text-4xl font-bold text-honor-blue mt-2">{user.voterProfile.balance} билетов</p>
            </div>

            <Separator />

            <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Способы получения билетов</h3>
                <div className="space-y-3">
                    <div className="flex items-start">
                        <CheckCircle
                            size={18}
                            className="text-green-500 mr-2 mt-0.5"
                        />
                        <p className="text-sm">
                            <span className="font-medium">Регистрация:</span> 10 билетов
                        </p>
                    </div>
                    <div className="flex items-start">
                        <Share2
                            size={18}
                            className="text-green-500 mr-2 mt-0.5"
                        />
                        <p className="text-sm">
                            <span className="font-medium">Реферальная программа:</span> 10 билетов за друга
                        </p>
                    </div>
                    <div className="flex items-start">
                        <ThumbsUp
                            size={18}
                            className="text-green-500 mr-2 mt-0.5"
                        />
                        <p className="text-sm">
                            <span className="font-medium">Активность:</span> 1 билет за 5 лайков
                        </p>
                    </div>
                    <div className="flex items-start">
                        <MessageSquare
                            size={18}
                            className="text-green-500 mr-2 mt-0.5"
                        />
                        <p className="text-sm">
                            <span className="font-medium">Комментарии:</span> 1 билет за комментарий
                        </p>
                    </div>
                    <div className="flex items-start">
                        <User
                            size={18}
                            className="text-green-500 mr-2 mt-0.5"
                        />
                        <p className="text-sm">
                            <span className="font-medium">Подписки:</span> 3 билета за новую подписку
                        </p>
                    </div>
                    <div className="flex items-start">
                        <Clock
                            size={18}
                            className="text-green-500 mr-2 mt-0.5"
                        />
                        <p className="text-sm">
                            <span className="font-medium">Ежедневный вход:</span> 1 билет в день
                        </p>
                    </div>
                </div>
            </div>

            <Separator />

            <div className="p-6">
                <button
                    className="flex items-center w-full justify-center bg-gray-100 hover:bg-gray-200 text-honor-darkGray rounded-xl py-3 transition-colors mb-4"
                    onClick={handleWatchAd}>
                    <Award
                        size={18}
                        className="mr-2"
                    />
                    Посмотреть рекламу (+1 билет)
                </button>

                <div className="border border-honor-blue/30 rounded-xl p-4">
                    <h3 className="text-sm font-semibold mb-2">Ваша реферальная ссылка</h3>
                    <div className="flex">
                        <Input
                            value={referralLink}
                            readOnly
                            className="text-xs bg-gray-50"
                        />
                        <Button
                            className="ml-2 bg-honor-blue text-white"
                            size="icon"
                            onClick={handleShareReferral}>
                            <Share2 size={16} />
                        </Button>
                    </div>
                    <p className="text-xs text-honor-darkGray mt-2">Пригласите друга и получите 10 билетов</p>
                </div>
            </div>
        </Card>
    );
};

export default BalanceSummary;
