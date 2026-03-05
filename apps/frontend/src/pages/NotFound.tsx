import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Home, MapPin, HelpCircle, ArrowLeft } from 'lucide-react';

const NotFound = () => {
    return (
        <Layout>
            <div className="honor-container py-20">
                <div className="max-w-md mx-auto text-center">
                    <div className="mb-8">
                        <div className="flex justify-center">
                            <div className="relative w-32 h-32">
                                <div className="absolute inset-0 bg-honor-blue/10 rounded-full flex items-center justify-center animate-pulse"></div>
                                <span className="absolute inset-0 flex items-center justify-center text-6xl font-bold text-honor-blue">
                                    404
                                </span>
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold mt-6 mb-4">Страница не найдена</h2>
                        <p className="text-honor-darkGray mb-8">
                            К сожалению, запрашиваемая страница не существует или была перемещена на другой адрес.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <Link to="/">
                            <Button className="flex items-center bg-honor-blue hover:bg-honor-darkBlue text-white w-full">
                                <Home
                                    size={18}
                                    className="mr-2"
                                />
                                Вернуться на главную
                            </Button>
                        </Link>

                        <div className="grid grid-cols-2 gap-4">
                            <Link to="/map">
                                <Button
                                    variant="outline"
                                    className="flex items-center w-full">
                                    <MapPin
                                        size={18}
                                        className="mr-2"
                                    />
                                    Карта округов
                                </Button>
                            </Link>
                            <Link to="/help">
                                <Button
                                    variant="outline"
                                    className="flex items-center w-full">
                                    <HelpCircle
                                        size={18}
                                        className="mr-2"
                                    />
                                    Помощь
                                </Button>
                            </Link>
                        </div>

                        <Button
                            variant="ghost"
                            className="flex items-center w-full text-honor-darkGray"
                            onClick={() => window.history.back()}>
                            <ArrowLeft
                                size={18}
                                className="mr-2"
                            />
                            Вернуться назад
                        </Button>
                    </div>

                    <div className="mt-8 text-sm text-honor-darkGray p-4 bg-gray-50 rounded-lg">
                        <p>Если вы искали:</p>
                        <ul className="mt-2 space-y-1 text-left">
                            <li className="hover:text-honor-blue">
                                <Link
                                    to="/representative/tasks"
                                    className="block p-2 hover:bg-gray-100 rounded">
                                    → Управление задачами представителя
                                </Link>
                            </li>
                            <li className="hover:text-honor-blue">
                                <Link
                                    to="/representatives"
                                    className="block p-2 hover:bg-gray-100 rounded">
                                    → Список всех представителей
                                </Link>
                            </li>
                            <li className="hover:text-honor-blue">
                                <Link
                                    to="/dashboard"
                                    className="block p-2 hover:bg-gray-100 rounded">
                                    → Личный кабинет избирателя
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default NotFound;
