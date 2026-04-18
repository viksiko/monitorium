import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Layout, User, RefreshCw, UserX } from 'lucide-react';
import Loader from '../ui/loader';
import { useGetSubscribers } from '@/lib/query/user.query';
import DataLoadingError from '../ui/dataLoadingError';
import { Avatar } from '@/components/ui/avatar';
import ItemCount from '../ui/itemCount';

const SubscribersTab = () => {
    const { data: subscribers, isLoading, isPending, isError, refetch } = useGetSubscribers();

    if (isError) {
        return (
            <Layout>
                <DataLoadingError message="Не удалось загрузить данные о подписчитках." />
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
                    <h2 className="text-2xl font-bold">Мои подписчики</h2>
                    <ItemCount count={subscribers.length} />
                </div>
                <div className="text-center">
                    <Button
                        className="honor-button-primary flex items-center"
                        onClick={() => refetch()}
                        disabled={isLoading}>
                        <RefreshCw
                            size={18}
                            className="mr-2"
                        />
                        Обновить список
                    </Button>
                </div>
            </div>

            <div className="space-y-4">
                {subscribers && subscribers.length > 0 && (
                    <div className="space-y-4 ">
                        {subscribers.map((sub) => (
                            <Card
                                className="p-4 hover:shadow-lg"
                                key={sub.id}>
                                <Link
                                    to={`/profile/${sub.id}`}
                                    className="flex items-center hover:bg-honor-gray/10 p-2 rounded-lg transition-colors">
                                    <Avatar className="justify-center items-center h-12 w-12 mr-4">
                                        <User size={24} />
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">{sub.name || 'Имя не указано'}</p>
                                        <p className="text-sm text-honor-darkGray">{sub.email}</p>
                                    </div>
                                </Link>
                            </Card>
                        ))}
                    </div>
                )}

                {subscribers.length === 0 && (
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

export default SubscribersTab;
