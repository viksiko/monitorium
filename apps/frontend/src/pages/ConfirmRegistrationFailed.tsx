import Layout from '@/components/layout/Layout';
import { AlertTriangle, ArrowRight, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const ConfirmRegistrationFailed = () => {
    return (
        <Layout>
            <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4">
                <div className="max-w-md w-full space-y-8 text-center">
                    {/* Иконка ошибки */}
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
                        <AlertTriangle className="h-8 w-8 text-red-600" />
                    </div>

                    {/* Заголовок и описание */}
                    <div className="space-y-4">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                            Ссылка для подтверждения устарела
                        </h1>

                        <p className="text-base text-gray-600">
                            Время действия ссылки для подтверждения истекло или
                            она уже была использована.
                        </p>

                        <div className="pt-2">
                            <p className="text-sm text-gray-500">
                                Запросите новую ссылку для подтверждения или
                                обратитесь в службу поддержки.
                            </p>
                        </div>
                    </div>

                    {/* Действия */}
                    <div className="pt-8 space-y-4">
                        {/* Кнопка повторной отправки */}
                        <Button
                            className="w-full honor-button-primary flex items-center justify-center space-x-2"
                            onClick={() => {
                                // Здесь будет логика повторной отправки подтверждения
                                // Например:
                                // sendConfirmationEmail(email);
                                // или
                                // navigate('/resend-confirmation');
                            }}>
                            <RefreshCw size={18} />
                            <span>Отправить ссылку повторно</span>
                        </Button>

                        {/* Кнопка регистрации */}
                        <Link
                            to="/register"
                            className="block">
                            <Button
                                variant="outline"
                                className="w-full flex items-center justify-center space-x-2">
                                <ArrowRight size={18} />
                                <span>Зарегистрироваться снова</span>
                            </Button>
                        </Link>

                        {/* Ссылка на поддержку */}
                        <div className="pt-4">
                            <Link
                                to="/support"
                                className="text-sm text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center space-x-1">
                                <span>Нужна помощь?</span>
                                <ArrowRight size={14} />
                            </Link>
                        </div>
                    </div>

                    {/* Альтернативные варианты */}
                    <div className="pt-8 border-t border-gray-200">
                        <p className="text-sm text-gray-500 mb-4">
                            Или воспользуйтесь другими вариантами:
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Link to="/login">
                                <Button
                                    variant="ghost"
                                    size="sm">
                                    Войти в аккаунт
                                </Button>
                            </Link>

                            <Link to="/">
                                <Button
                                    variant="ghost"
                                    size="sm">
                                    На главную
                                </Button>
                            </Link>

                            <Link to="/contact">
                                <Button
                                    variant="ghost"
                                    size="sm">
                                    Связаться с нами
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default ConfirmRegistrationFailed;
