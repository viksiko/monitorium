import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { User, Mail, Phone, Lock, Loader2 } from 'lucide-react';
import {
    RegisterStep1FormValues,
    registerStep1Schema,
} from '@/zod/registerStep1.schema';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormError, formInputClass } from '../ui/formInputClass';

interface RegisterStep1Props {
    onSubmit: (data: RegisterStep1FormValues) => void;
    isLoading: boolean;
}

const RepresentativeStep1 = ({ onSubmit, isLoading }: RegisterStep1Props) => {
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<RegisterStep1FormValues>({
        resolver: zodResolver(registerStep1Schema),
    });

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="honor-card">
            <div className="mb-6">
                <Label
                    htmlFor="fullName"
                    className="block mb-2">
                    ФИО
                </Label>
                <div className="relative">
                    <User
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-honor-darkGray"
                        size={18}
                    />
                    <Input
                        id="fullName"
                        name="fullName"
                        {...register('fullName')}
                        placeholder="Иванов Иван Иванович"
                        className={formInputClass(errors.fullName)}
                    />
                    <FormError error={errors.fullName} />
                </div>
            </div>

            <div className="mb-6">
                <Label
                    htmlFor="email"
                    className="block mb-2">
                    Электронная почта
                </Label>
                <div className="relative">
                    <Mail
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-honor-darkGray"
                        size={18}
                    />
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        {...register('email')}
                        className={formInputClass(errors.email)}
                        placeholder="example@mail.ru"
                    />
                    <FormError error={errors.email} />
                </div>
            </div>

            <div className="mb-6">
                <Label
                    htmlFor="password"
                    className="block mb-2">
                    Пароль
                </Label>
                <div className="relative">
                    <Lock
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-honor-darkGray"
                        size={18}
                    />
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        className={formInputClass(errors.password)}
                        placeholder="Введите пароль"
                        {...register('password')}
                    />
                    <FormError error={errors.password} />
                </div>
            </div>

            <div className="mb-6">
                <Label
                    htmlFor="password"
                    className="block mb-2">
                    Подтвердите пароль
                </Label>
                <div className="relative">
                    <Lock
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-honor-darkGray"
                        size={18}
                    />
                    <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        className={formInputClass(errors.confirmPassword)}
                        placeholder="Введите пароль"
                        {...register('confirmPassword')}
                    />
                    <FormError error={errors.confirmPassword} />
                </div>
            </div>

            <div className="mb-6">
                <Label
                    htmlFor="phone"
                    className="block mb-2">
                    Номер телефона (не обязательно)
                </Label>
                <div className="relative">
                    <Phone
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-honor-darkGray"
                        size={18}
                    />
                    <Input
                        id="phone"
                        name="phone"
                        className={formInputClass(errors.phone)}
                        placeholder="+7 (___) ___-__-__"
                        {...register('phone', {
                            setValueAs: (value) => value.replace(/[^0-9]/g, ''),
                        })}
                    />
                    <FormError error={errors.phone} />
                </div>
            </div>

            <Button
                type="submit"
                disabled={isLoading}
                className="w-full honor-button-primary">
                {isLoading ? (
                    <Loader2 className="h-8 w-8 animate-spin" />
                ) : (
                    'Продолжить'
                )}
            </Button>

            <div className="mt-4 text-xs text-honor-darkGray text-center">
                Нажимая "Продолжить", вы соглашаетесь с правилами использования
                платформы и даете согласие на обработку персональных данных
            </div>
        </form>
    );
};

export default RepresentativeStep1;
