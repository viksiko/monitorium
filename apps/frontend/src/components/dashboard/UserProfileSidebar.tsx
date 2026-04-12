import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, MapPin, Plus, Crown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const UserProfileSidebar = () => {
    const { user } = useAuth();

    // if (loading) {
    //     return (
    //         <Card className="honor-card mb-6">
    //             <div className="flex flex-col items-center p-6">
    //                 <div className="h-24 w-24 bg-gray-200 rounded-full mb-4 animate-pulse"></div>
    //                 <div className="h-6 w-32 bg-gray-200 rounded mb-2 animate-pulse"></div>
    //                 <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
    //             </div>
    //         </Card>
    //     );
    // }

    // if (!user) {
    //     return (
    //         <Card className="honor-card mb-6">
    //             <div className="flex flex-col items-center p-6">
    //                 <p className="text-honor-darkGray">
    //                     Пользователь не найден
    //                 </p>
    //             </div>
    //         </Card>
    //     );
    // }

    const getUserRoleText = () => {
        switch (user.role) {
            case 'REPRESENTATIVE':
                return 'Представитель власти';
            case 'ADMIN':
                return 'Администратор';
            default:
                return 'Избиратель';
        }
    };

    const getUserInitials = () => {
        if (!user.name) return 'U';
        const names = user.name.split(' ');
        return names
            .map((name) => name[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <Card className="honor-card mb-6">
            <div className="flex flex-col items-center p-6">
                <Avatar className="justify-center items-center h-24 w-24 mb-4 bg-honor-blue text-white text-xl font-bold">
                    {user.name ? getUserInitials() : <User size={48} />}
                </Avatar>
                <h1 className="text-2xl font-bold">{user.name || 'Пользователь'}</h1>
                <div className="flex items-center gap-2">
                    <p className="text-honor-darkGray">{getUserRoleText()}</p>
                    {user.isRepresentative && (
                        <Crown
                            size={16}
                            className="text-yellow-500"
                        />
                    )}
                </div>
                {user.district && (
                    <div className="flex items-center mt-2">
                        <MapPin
                            size={16}
                            className="text-honor-blue mr-1"
                        />
                        {/* <span className="text-sm">{user.district}</span> */}
                    </div>
                )}
                {user.isVerified && <Badge className="mt-2 bg-green-500">Верифицирован</Badge>}
                {user.voterProfile?.balance !== undefined && (
                    <Badge className="mt-2 bg-honor-blue">{user.voterProfile.balance} токенов</Badge>
                )}
            </div>

            <div className="border-t border-b py-4 mb-4">
                <div className="grid grid-cols-3 text-center">
                    <div>
                        <p className="text-2xl font-bold text-honor-blue">
                            {user.isRepresentative ? user.representativeProfile?.rating || 0 : '0'}
                        </p>
                        <p className="text-xs text-honor-darkGray">{user.isRepresentative ? 'Рейтинг' : 'Заданий'}</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-honor-blue">0</p>
                        <p className="text-xs text-honor-darkGray">Реакций</p>
                    </div>
                    {user.voterProfile && (
                        <div>
                            <p className="text-2xl font-bold text-honor-blue">{user.voterProfile.balance}</p>
                            <p className="text-xs text-honor-darkGray">Токенов</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-6">
                {!user.isRepresentative && (
                    <>
                        <h3 className="text-lg font-semibold mb-4">Мой представитель</h3>
                        {user.subscriptions && user.subscriptions.length > 0 ? (
                            // Если подписки есть — выводим список
                            <div className="space-y-3">
                                {user.subscriptions.map((sub) => (
                                    <Link
                                        to={`/representative/profile/${sub.representative.id}`}
                                        key={sub.id}>
                                        <div className="flex items-center mb-4 hover:shadow-lg p-3 border rounded-xl bg-white shadow-sm">
                                            <div className="bg-honor-gray rounded-full p-2 mr-3">
                                                <User
                                                    size={24}
                                                    className="text-honor-blue"
                                                />
                                            </div>
                                            <div>
                                                <p className="font-medium">
                                                    {sub.representative?.name || 'Имя не указано'}
                                                </p>
                                                <p className="text-sm text-honor-darkGray">
                                                    {sub.representative.representativeProfile?.position ||
                                                        'Должность не указана'}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            // Если подписок нет — выводим заглушку
                            <div className="flex items-center p-3 border rounded-xl bg-gray-50">
                                <div className="bg-honor-gray rounded-full p-2 mr-3">
                                    <User
                                        size={24}
                                        className="text-gray-400"
                                    />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-500">Не назначен</p>
                                    <p className="text-sm text-honor-darkGray">Выберите представителя в каталоге</p>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {user.isRepresentative && (
                    <>
                        <h3 className="text-lg font-semibold mb-4">Статистика</h3>
                        <div className="space-y-2 mb-4">
                            {user.representativeProfile?.position && (
                                <p className="text-sm">
                                    <span className="font-medium">Должность:</span>{' '}
                                    {user.representativeProfile.position}
                                </p>
                            )}
                            {user.representativeProfile?.party && (
                                <p className="text-sm">
                                    <span className="font-medium">Партия:</span> {user.representativeProfile.party}
                                </p>
                            )}
                            <p className="text-sm">
                                <span className="font-medium">Email:</span> {user.email}
                            </p>
                            {user.phone && (
                                <p className="text-sm">
                                    <span className="font-medium">Телефон:</span> {user.phone}
                                </p>
                            )}
                        </div>
                    </>
                )}

                <h3 className="text-lg font-semibold mt-6 mb-4">Быстрые действия</h3>
                <div className="flex flex-col space-y-3">
                    {!user.isRepresentative && (
                        <Link to="/tasks/create">
                            <Button className="w-full honor-button-primary flex items-center justify-center">
                                <Plus
                                    size={18}
                                    className="mr-2"
                                />
                                Создать задание
                            </Button>
                        </Link>
                    )}
                    <Link to="/map">
                        <Button className="w-full honor-button-secondary flex items-center justify-center">
                            <MapPin
                                size={18}
                                className="mr-2"
                            />
                            Открыть карту округов
                        </Button>
                    </Link>
                    <Link to="/balance">
                        <Button className="w-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-honor-darkGray">
                            <Plus
                                size={18}
                                className="mr-2"
                            />
                            Пополнить баланс
                        </Button>
                    </Link>
                </div>
            </div>
        </Card>
    );
};

export default UserProfileSidebar;
