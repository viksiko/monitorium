import ErrorPage from '@/components/errors/ErrorPage';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const ServerError = () => {
    return (
        <ErrorPage
            code="500"
            title="Ошибка сервера"
            message="Произошла внутренняя ошибка сервера. Мы уже работаем над её устранением.">
            <div className="mt-8 text-sm text-honor-darkGray p-4 bg-gray-50 rounded-lg">
                <p>Вы можете:</p>
                <ul className="mt-2 space-y-1 text-left">
                    <li className="hover:text-honor-blue">
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full text-left block p-2 hover:bg-gray-100 rounded">
                            → Обновить страницу
                        </button>
                    </li>
                    <li className="hover:text-honor-blue">
                        <Link
                            to="/login"
                            className="block p-2 hover:bg-gray-100 rounded">
                            → Выйти и войти снова
                        </Link>
                    </li>
                </ul>
            </div>
            <div className="mt-4">
                <Link to="/help">
                    <Button variant="link">
                        Обратиться в техническую поддержку
                    </Button>
                </Link>
            </div>
        </ErrorPage>
    );
};

export default ServerError;
