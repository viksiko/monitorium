import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

const RESEND_COOLDOWN_SEC = 60;

function formatMmSs(totalSeconds: number): string {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

interface VerificationStepProps {
    verificationCode: string;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSubmit: (e: React.FormEvent) => void;
    goBack: () => void;
    hasNextStep?: boolean;
    onResendCode?: () => void;
}

const VerificationStep = ({
    verificationCode,
    handleChange,
    handleSubmit,
    goBack,
    hasNextStep,
    onResendCode,
}: VerificationStepProps) => {
    const [secondsLeft, setSecondsLeft] = useState(RESEND_COOLDOWN_SEC);

    useEffect(() => {
        const id = window.setInterval(() => {
            setSecondsLeft((prev) => (prev <= 0 ? 0 : prev - 1));
        }, 1000);

        return () => window.clearInterval(id);
    }, []);

    const canResend = secondsLeft === 0;

    const handleResendClick = () => {
        if (!canResend) return;
        onResendCode?.();
        setSecondsLeft(RESEND_COOLDOWN_SEC);
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="honor-card">
            <div className="text-center mb-6">
                <CheckCircle
                    className="mx-auto text-honor-blue"
                    size={48}
                />
                <h2 className="text-xl font-bold mt-4 mb-2">Подтвердите регистрацию</h2>
                <p className="text-honor-darkGray">
                    Мы отправили код подтверждения на указанную вами электронную почту
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
                        onClick={handleResendClick}
                        disabled={!canResend}
                        className={
                            canResend ? 'text-honor-blue hover:underline' : 'text-honor-darkGray cursor-not-allowed'
                        }>
                        Отправить код повторно
                    </button>
                    <span className="text-honor-darkGray">{formatMmSs(secondsLeft)}</span>
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
