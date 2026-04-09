import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, MailCheck, MailSearch, Mails } from 'lucide-react';
import { Dialog } from '@monorepo/types';
import { useApi } from '@/hooks/useApi';
import { useAuth } from '@/context/AuthContext';
import Loader from '@/components/ui/loader';

const MessagesTab = () => {
    const { user } = useAuth();
    const { loading: loadingDialogsStart, request: loadDialogsStart } = useApi<Dialog[]>();
    const [dialogs, setDialogs] = useState<Dialog[]>([]);
    const { request: loadDialogs } = useApi<Dialog[]>();
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const currentUserId = user.id;

    // Загрузка диалогов при монтировании компонента
    useEffect(() => {
        const fetchDialogs = async () => {
            try {
                const response = await loadDialogsStart({
                    method: 'GET',
                    url: '/api/v1/dialogs',
                });

                if (response) {
                    setDialogs(response);
                }
            } finally {
                setIsInitialLoading(false);
            }
        };

        fetchDialogs();
    }, []); // Зависимости пустые, выполнится только один раз

    // автоматическое обновление сообщений каждые 5 секунд
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                // 1️⃣ Обновляем список диалогов
                const newDialogs = await loadDialogs({
                    method: 'GET',
                    url: '/api/v1/dialogs',
                });

                if (newDialogs) {
                    setDialogs(newDialogs);
                }
            } catch (e) {
                console.log('Ошибка автообновления', e);
            }
        }, 10000); // один общий интервал (10 сек)

        return () => clearInterval(interval);
    }, []);

    const unreadDialogs = dialogs.filter((dialog) => {
        const lastMessage = dialog.messages?.[0];
        if (!lastMessage) return false;

        const isVoter = dialog.voterId === currentUserId;

        const lastReadAt = isVoter ? dialog.voterLastReadAt : dialog.representativeLastReadAt;

        // если сообщение отправил сам пользователь — пропускаем
        if (lastMessage.senderId === currentUserId) return false;

        // если lastReadAt null → всё непрочитано
        if (!lastReadAt) return true;

        return new Date(lastMessage.createdAt) > new Date(lastReadAt);
    });

    if (isInitialLoading) {
        return (
            <div className="text-center">
                <Loader />
            </div>
        );
    }

    return (
        <>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Новые сообщения</h2>
                <div className="text-center">
                    <Link to="/messages">
                        <Button className="honor-button-primary flex items-center">
                            <Mails
                                size={18}
                                className="mr-2"
                            />
                            Перейти в центр сообщений
                        </Button>
                    </Link>
                </div>
            </div>

            {unreadDialogs.map((dialog) => {
                const lastMessage = dialog.messages[0];
                const companion = dialog.voterId === currentUserId ? dialog.representative : dialog.voter;

                return (
                    <Card
                        key={dialog.id}
                        className="p-4 bg-blue-50">
                        <div className="flex items-start">
                            <Avatar className="justify-center items-centerh-10 w-10 mr-3 mt-1">
                                <User size={20} />
                            </Avatar>

                            <div className="flex-1">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-medium">
                                        {companion.name}
                                        <Badge className="ml-2 bg-honor-blue text-white text-xs">Новое</Badge>
                                    </h3>

                                    <span className="text-xs text-honor-darkGray">
                                        {new Date(lastMessage.createdAt).toLocaleDateString('ru-RU')}
                                    </span>
                                </div>

                                <p className="text-sm mt-1 italic">{lastMessage.text}</p>
                            </div>
                        </div>
                    </Card>
                );
            })}

            {unreadDialogs.length === 0 && (
                <div className="text-center py-10">
                    <MailCheck
                        className="mx-auto mb-4 text-green-500"
                        size={64}
                    />
                    <p className="text-honor-darkGray">У вас пока нет новых сообщений</p>
                </div>
            )}
        </>
    );
};

export default MessagesTab;
