import Layout from '@/components/layout/Layout';
import { LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const ConfirmRegistration = () => {
    return (
        <>
            <Layout>
                <div className="flex flex-col items-center justify-center min-h-screen py-12">
                    <div className="max-w-md w-full space-y-8 text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                            <svg
                                className="h-6 w-6 text-green-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        </div>

                        <h1 className="text-3xl font-bold text-gray-900">
                            Регистрация успешно подтверждена!
                        </h1>

                        <p className="text-lg text-gray-600">
                            Ваш аккаунт был подтвержден. Теперь вы можете войти
                            в систему.
                        </p>

                        <div className="flex justify-center pt-6">
                            <Link to="/login">
                                <Button className="honor-button-primary flex items-center space-x-1">
                                    <LogIn size={18} />
                                    <span>Логин</span>
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </Layout>
        </>
    );
};

export default ConfirmRegistration;
