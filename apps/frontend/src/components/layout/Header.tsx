import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { User, MapPin, Plus, LogIn, Bell, Ticket } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from '@/components/ui/dialog';
import { TestApiButton } from '../ui/testApiButton';
import { useAuth } from '@/context/AuthContext';
import { useLogout } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Header = () => {
    // Mock ticket count - in a real app, this would come from user state
    const ticketCount = 35;

    const navigate = useNavigate();
    const { user, isLoading } = useAuth();
    const { mutate: logout } = useLogout();

    // if (isLoading) {
    //     return null; // или skeleton
    // }

    const test = true;

    return (
        <header className="bg-white shadow-sm">
            <TestApiButton />
            <div className="honor-container py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Link
                            to="/"
                            className="flex items-center">
                            <span className="text-2xl font-bold text-honor-blue whitespace-nowrap">
                                Мониториум
                            </span>
                        </Link>
                    </div>

                    <nav className="hidden md:flex items-center space-x-6">
                        {user && (
                            <Link
                                to="/tasks/create"
                                className="flex items-center space-x-1 text-honor-text hover:text-honor-blue transition-colors">
                                <Plus size={20} />
                                <span>Создать задание</span>
                            </Link>
                        )}
                        <Link
                            to="/map"
                            className="flex items-center space-x-1 text-honor-text hover:text-honor-blue transition-colors">
                            <MapPin size={20} />
                            <span>Карта округов</span>
                        </Link>
                        <Link
                            to="/representatives"
                            className="flex items-center space-x-1 text-honor-text hover:text-honor-blue transition-colors">
                            <User size={20} />
                            <span>Представители</span>
                        </Link>
                    </nav>

                    <div className="flex items-center space-x-4">
                        {/* Ticket indicator */}
                        {user && (
                            <>
                                <Link
                                    to="/balance"
                                    className="flex items-center px-3 py-1 rounded-full bg-honor-gray hover:bg-honor-blue/10 transition-colors">
                                    <Ticket
                                        size={16}
                                        className="text-honor-blue mr-1"
                                    />
                                    <span className="text-sm font-medium">
                                        {ticketCount}
                                    </span>
                                </Link>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="relative">
                                            <Bell size={20} />
                                            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>
                                                Подписки и уведомления
                                            </DialogTitle>
                                            <DialogDescription>
                                                Управляйте подписками и
                                                просматривайте последние
                                                уведомления
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="py-4">
                                            <div className="space-y-4">
                                                <div>
                                                    <h3 className="text-sm font-medium">
                                                        Вы подписаны на
                                                        следующие округа:
                                                    </h3>
                                                    <div className="mt-2 space-y-2">
                                                        <div className="flex justify-between items-center p-2 bg-honor-gray rounded">
                                                            <div className="flex items-center">
                                                                <MapPin
                                                                    size={16}
                                                                    className="text-honor-blue mr-2"
                                                                />
                                                                <span>
                                                                    Округ №3
                                                                </span>
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm">
                                                                Отписаться
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-medium">
                                                        Последние уведомления:
                                                    </h3>
                                                    <div className="mt-2 space-y-2">
                                                        <div className="p-2 bg-honor-gray rounded">
                                                            <p className="text-sm font-medium">
                                                                Новое задание в
                                                                Округе №3
                                                            </p>
                                                            <p className="text-xs text-honor-darkGray">
                                                                15 минут назад
                                                            </p>
                                                        </div>
                                                        <div className="p-2 bg-honor-gray rounded">
                                                            <p className="text-sm font-medium">
                                                                Встреча с
                                                                жителями
                                                                перенесена
                                                            </p>
                                                            <p className="text-xs text-honor-darkGray">
                                                                2 часа назад
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </>
                        )}
                        {!user ? (
                            <Link to="/login">
                                <Button className="honor-button-primary flex items-center space-x-1">
                                    <LogIn size={18} />
                                    <span>Логин</span>
                                </Button>
                            </Link>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Link
                                    to="/dashboard"
                                    className="text-sm font-medium text-gray-700 cursor-pointer hover:text-blue-600 hover:underline transition-all">
                                    <span>{user.name}</span>
                                </Link>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        logout();
                                        navigate('/login');
                                    }}>
                                    Выход
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
