import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

interface VerificationStepProps {
    verificationCode: string;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSubmit: (e: React.FormEvent) => void;
    goBack: () => void;
    hasNextStep?: boolean;
}

const VerificationStep = ({
    verificationCode,
    handleChange,
    handleSubmit,
    goBack,
    hasNextStep,
}: VerificationStepProps) => {
    return (
        <form
            onSubmit={handleSubmit}
            className="honor-card">
            <div className="text-center mb-6">
                <CheckCircle
                    className="mx-auto text-honor-blue"
                    size={48}
                />
                <h2 className="text-xl font-bold mt-4 mb-2">
                    Подтвердите регистрацию
                </h2>
                <p className="text-honor-darkGray">
                    Мы отправили код подтверждения на указанную вами электронную
                    почту
                </p>
            </div>

            <div className="mb-6">
                <Label
                    htmlFor="verificationCode"
                    className="block mb-2">
                    Код подтверждения
                </Label>
                <Input
                    id="verificationCode"
                    name="verificationCode"
                    value={verificationCode}
                    onChange={handleChange}
                    className="honor-input text-center text-xl tracking-widest"
                    placeholder="• • • • • •"
                    maxLength={6}
                    required
                />
                <div className="flex justify-between mt-2 text-sm">
                    <button
                        type="button"
                        className="text-honor-blue hover:underline">
                        Отправить код повторно
                    </button>
                    <span className="text-honor-darkGray">00:59</span>
                </div>
            </div>

            <Button
                type="submit"
                className="w-full honor-button-primary mb-4">
                {hasNextStep ? 'Продолжить' : 'Завершить регистрацию'}
            </Button>

            <div className="text-center">
                <button
                    type="button"
                    onClick={goBack}
                    className="text-honor-blue hover:underline">
                    Вернуться назад
                </button>
            </div>
        </form>
    );
};

export default VerificationStep;
