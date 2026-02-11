import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import {
    GosuslugiAuthButton,
    SberAuthButton,
    TinkoffAuthButton,
} from '@/components/auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormValues } from '@/zod/login.schema';
import { FormError, formInputClass } from '@/components/ui/formInputClass';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { toast } = useToast();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });
    // const [formData, setFormData] = useState({
    //     email: '',
    //     password: '',
    // });
    const [isLoading, setIsLoading] = useState(false);

    // const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     const { name, value } = e.target;
    //     setFormData({
    //         ...formData,
    //         [name]: value,
    //     });
    // };

    const onSubmit = async (data: LoginFormValues) => {
        setIsLoading(true);

        try {
            await login(data.email, data.password);

            // toast({
            //     title: 'Вход выполнен успешно!',
            //     description: 'Добро пожаловать в систему «Мониториум»',
            //     variant: 'success',
            // });

            // navigate('/dashboard', {
            //     state: {
            //         loginSuccess: true,
            //     },
            // });
        } catch (error) {
            // toast({
            //     title: 'Ошибка входа',
            //     description:
            //         error.response?.data?.data?.message ||
            //         'Произошла ошибка при авторизации.',
            //     variant: 'destructive',
            // });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Layout>
            <div className="honor-container py-12">
                <div className="max-w-md mx-auto">
                    <h1 className="text-3xl font-bold mb-8 text-center">
                        Вход в систему
                    </h1>

                    {/* авторизация с помощью сторонних сервисов */}
                    {/* <div className="flex flex-col gap-3 mb-6">
                        <GosuslugiAuthButton />
                        <SberAuthButton />
                        <TinkoffAuthButton />
                    </div>

                    <div className="flex items-center my-6">
                        <Separator className="flex-grow" />
                        <span className="px-4 text-sm text-honor-darkGray">
                            или
                        </span>
                        <Separator className="flex-grow" />
                    </div> */}

                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="honor-card">
                        <div className="mb-6">
                            <Label
                                htmlFor="email"
                                className="block mb-2">
                                Электронная почта или телефон
                            </Label>
                            <div className="relative">
                                <Mail
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-honor-darkGray"
                                    size={18}
                                />
                                <Input
                                    id="email"
                                    name="email"
                                    {...register('email')}
                                    className={formInputClass(errors.email)}
                                    placeholder="example@mail.ru"
                                />

                                <FormError error={errors.email} />
                            </div>
                        </div>

                        <div className="mb-6">
                            <div className="flex justify-between mb-2">
                                <Label htmlFor="password">Пароль</Label>
                                <Link
                                    to="/forgot-password"
                                    className="text-sm text-honor-blue hover:underline">
                                    Забыли пароль?
                                </Link>
                            </div>
                            <div className="relative">
                                <Lock
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-honor-darkGray"
                                    size={18}
                                />
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    {...register('password')}
                                    className={formInputClass(errors.password)}
                                    placeholder="••••••••"
                                />

                                <FormError error={errors.password} />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full honor-button-primary"
                            disabled={isLoading}>
                            {isLoading ? (
                                <Loader2 className="h-8 w-8 animate-spin" />
                            ) : (
                                'Войти'
                            )}
                        </Button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-honor-darkGray">
                            Еще не зарегистрированы?{' '}
                            <Link
                                to="/register"
                                className="text-honor-blue hover:underline">
                                Регистрация
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Login;
