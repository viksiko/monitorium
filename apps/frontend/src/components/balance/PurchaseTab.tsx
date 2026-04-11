import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Loader2 } from 'lucide-react';
import { TOKEN_PARAMS } from '@/constants/tokens-params';

interface PurchaseTabProps {
    selectedAmount: number | null;
    setSelectedAmount: (amount: number | null) => void;
    handlePurchase: () => void;
    isLoading: boolean;
}

const PurchaseTab: React.FC<PurchaseTabProps> = ({ selectedAmount, setSelectedAmount, handlePurchase, isLoading }) => {
    const handleAmountChange = (value: string) => {
        if (!value) {
            setSelectedAmount(null);
            return;
        }

        let num = parseInt(value);

        if (isNaN(num)) return;

        if (num > TOKEN_PARAMS.MAX) num = TOKEN_PARAMS.MAX;
        if (num < TOKEN_PARAMS.MIN) num = TOKEN_PARAMS.MIN;

        setSelectedAmount(num);
    };

    return (
        <Card className="honor-card mb-6">
            <div className="p-6">
                <h2 className="text-xl font-bold mb-4">Пополнение баланса билетов</h2>
                <p className="text-honor-darkGray mb-6">
                    Выберите количество билетов для покупки. 10 билетов = 100 рублей.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                    {TOKEN_PARAMS.TOP_UP_AMOUNTS.map((amount) => (
                        <button
                            key={amount}
                            className={`border rounded-xl p-4 text-center transition-colors ${
                                selectedAmount === amount
                                    ? 'bg-honor-blue text-white border-honor-blue'
                                    : 'border-gray-300 hover:border-honor-blue'
                            }`}
                            onClick={() => setSelectedAmount(amount)}>
                            <p className="font-bold text-lg">{amount}</p>
                            <p className={selectedAmount === amount ? 'text-white/80' : 'text-honor-darkGray'}>
                                билетов
                            </p>
                            <p
                                className={`text-sm mt-1 ${selectedAmount === amount ? 'text-white/80' : 'text-honor-darkGray'}`}>
                                {amount * 10} ₽
                            </p>
                        </button>
                    ))}
                </div>

                <div className="mb-6">
                    <Label
                        htmlFor="custom-amount"
                        className="block mb-2">
                        Или введите своё количество билетов
                    </Label>
                    <div className="flex">
                        <Input
                            id="custom-amount"
                            type="number"
                            min="1"
                            max="999999"
                            placeholder="Количество билетов"
                            className="honor-input"
                            onChange={(e) => handleAmountChange(e.target.value)}
                            value={selectedAmount ?? ''}
                        />
                        <div className="flex justify-center ml-4 py-2 px-4 bg-gray-100 rounded-xl items-center w-[130px]">
                            <span className="text-honor-darkGray font-bold">
                                {selectedAmount ? selectedAmount * 10 : 0} ₽
                            </span>
                        </div>
                    </div>
                </div>

                <h3 className="text-lg font-semibold mb-4">Способ оплаты</h3>
                <div className="space-y-3 mb-6">
                    <div className="flex items-center border rounded-xl p-4">
                        <input
                            type="radio"
                            id="payment-card"
                            name="payment-method"
                            className="h-4 w-4 text-honor-blue"
                            defaultChecked
                        />
                        <label
                            htmlFor="payment-card"
                            className="ml-2 flex items-center">
                            <CreditCard
                                size={18}
                                className="text-honor-darkGray mr-2"
                            />
                            <span>Банковская карта</span>
                        </label>
                    </div>
                    <div className="flex items-center border rounded-xl p-4">
                        <input
                            type="radio"
                            id="payment-sbp"
                            name="payment-method"
                            className="h-4 w-4 text-honor-blue"
                        />
                        <label
                            htmlFor="payment-sbp"
                            className="ml-2">
                            Система быстрых платежей (СБП)
                        </label>
                    </div>
                </div>

                <Button
                    className="w-full honor-button-primary"
                    disabled={!selectedAmount || isLoading}
                    onClick={handlePurchase}>
                    {isLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : 'Пополнить баланс'}
                </Button>
            </div>
        </Card>
    );
};

export default PurchaseTab;
