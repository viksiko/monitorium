import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Search, User, UserSearch, UserX } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const SubscriptionsTab = () => {
    const { user } = useAuth();

    return (
        <>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Мои подписки</h2>
                <div className="text-center">
                    <Link to="/representatives">
                        <Button className="honor-button-primary flex items-center">
                            <UserSearch
                                size={18}
                                className="mr-2"
                            />
                            Найти представителей
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="space-y-4">
                {user.subscriptions && user.subscriptions.length > 0 && (
                    // Если подписки есть — выводим список
                    <div className="space-y-4 ">
                        {user.subscriptions.map((sub) => (
                            <Card
                                className="p-4 hover:shadow-lg"
                                key={sub.id}>
                                <Link
                                    to={`/representative/profile/${sub.representative.id}`}
                                    className="flex items-center hover:bg-honor-gray/10 p-2 rounded-lg transition-colors">
                                    <Avatar className="h-12 w-12 mr-4">
                                        <User size={24} />
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">{sub.representative?.name || 'Имя не указано'}</p>
                                        <p className="text-sm text-honor-darkGray">
                                            {sub.representative.representativeProfile?.position ||
                                                'Должность не указана'}
                                        </p>
                                    </div>
                                </Link>
                            </Card>
                        ))}
                    </div>
                )}

                {user.subscriptions.length === 0 && (
                    <div className="text-center py-10">
                        <UserX
                            className="mx-auto mb-4 text-honor-darkGray"
                            size={64}
                        />
                        <p className="text-honor-darkGray">У вас пока нет подписок</p>
                    </div>
                )}
            </div>
        </>
    );
};

export default SubscriptionsTab;
