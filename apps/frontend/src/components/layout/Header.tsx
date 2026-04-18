import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { UserStar, MapPin, Plus, LogIn, Bell, Ticket, Trash2, CircleX, X } from 'lucide-react';
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
import { useGetNotification, useReadNotification } from '@/lib/query/notificateion.query';
import { useMutation } from '@tanstack/react-query';
import Loader from '../ui/loader';
import NotificationsDialog from '../notification/NotificationsDialog';
import { TaskCreateLink } from '../ui/taskCreateLink';

const Header = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { mutate: logout } = useLogout();

    // if (isLoading) {
    //     return null; // или skeleton
    // }

    return (
        <header className="bg-white shadow-sm">
            <TestApiButton />
            <div className="honor-container py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Link
                            to="/"
                            className="flex items-center">
                            <div className="flex items-center gap-[2px] whitespace-nowrap group">
                                <div className="bg-honor-blue text-white text-xl font-bold w-7 h-7 flex items-center justify-center rounded transition-transform group-hover:scale-110">
                                    М
                                </div>
                                <span className="text-2xl font-bold text-honor-blue">ониториум</span>
                            </div>
                        </Link>
                    </div>

                    <nav className="hidden md:flex items-center space-x-6">
                        {user && (
                            <>
                                <TaskCreateLink isShowIcon={true} />
                                <Link
                                    to="/map"
                                    className="flex items-center space-x-1 text-honor-text hover:text-honor-blue transition-colors">
                                    <MapPin size={20} />
                                    <span>Карта округов</span>
                                </Link>
                                <Link
                                    to="/representatives"
                                    className="flex items-center space-x-1 text-honor-text hover:text-honor-blue transition-colors">
                                    <UserStar size={20} />
                                    <span>Представители</span>
                                </Link>
                            </>
                        )}
                    </nav>

                    <div className="flex items-center space-x-4">
                        {user && (
                            <>
                                {!user.isRepresentative && (
                                    <Link
                                        to="/balance"
                                        className="flex items-center gap-2 px-2 py-0 rounded-full bg-gradient-to-r from-honor-blue/10 to-honor-blue/5 hover:from-honor-blue/20 hover:to-honor-blue/10 transition-all duration-300 border border-honor-blue/20">
                                        <div className="relative">
                                            <Ticket
                                                size={18}
                                                className="text-honor-blue"
                                            />
                                        </div>
                                        <span className="text-sm font-medium text-honor-darkGray">Баланс:</span>
                                        <span className="font-bold text-honor-blue">{user.voterProfile.balance}</span>
                                        <span className="text-xs text-honor-darkGray"></span>
                                    </Link>
                                )}
                                <NotificationsDialog />
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
                                    className="text-sm font-medium text-gray-700 cursor-pointer hover:underline transition-all">
                                    <div className="flex flex-col gap-0">
                                        <span className="text-[16px] font-bold text-gray-700 dark:text-gray-200">
                                            {user.name}
                                        </span>
                                        <span className="text-xs text-gray-400 dark:text-gray-500">{user.email}</span>
                                    </div>
                                </Link>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        logout();
                                        // navigate('/login');
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
