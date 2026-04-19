import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Layout, Search, User, UserSearch, UserX } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useGetSubscriptions } from '@/lib/query/user.query';
import DataLoadingError from '../ui/dataLoadingError';
import Loader from '../ui/loader';
import ItemCount from '../ui/itemCount';
import { formatPartyName } from '@/utils/formatPartyName';
import { Badge } from '@/components/ui/badge';

const SubscriptionsTab = () => {
    const { data: subscribtions, isLoading, isPending, isError } = useGetSubscriptions();

    if (isError) {
        return (
            <Layout>
                <DataLoadingError message="Не удалось загрузить данные о подписках." />
            </Layout>
        );
    }

    if (isLoading || isPending) {
        return (
            <div className="text-center">
                <Loader />
            </div>
        );
    }

    return (
        <>
            <div className="flex justify-between items-center mb-4">
                <div className="flex gap-2 items-center">
                    <h2 className="text-2xl font-bold">Мои подписки</h2>
                    <ItemCount count={subscribtions.length} />
                </div>
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
                {subscribtions && subscribtions.length > 0 && (
                    <div className="space-y-4 ">
                        {subscribtions.map((sub) => (
                            <Card
                                className="p-4 hover:shadow-lg"
                                key={sub.id}>
                                <Link
                                    to={`/representative/profile/${sub.id}`}
                                    className="flex items-center hover:bg-honor-gray/10 p-2 rounded-lg transition-colors">
                                    <Avatar className="justify-center items-center h-12 w-12 mr-4">
                                        <User size={24} />
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">{sub.name || 'Имя не указано'}</p>

                                        <div className="flex text-honor-darkGray">
                                            <p>{sub.representativeProfile?.position || 'Должность не указана'}</p>
                                            <span className="mx-2">•</span>
                                            <Badge className="bg-honor-blue">
                                                {formatPartyName(sub.representativeProfile.party)}
                                            </Badge>
                                        </div>
                                    </div>
                                </Link>
                            </Card>
                        ))}
                    </div>
                )}

                {subscribtions.length === 0 && (
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
