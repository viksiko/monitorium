import { useState, useEffect, useRef } from 'react';
import Layout from '@/components/layout/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar } from '@/components/ui/avatar';
import { User, Search, Send, Clock, Plus, MessageSquare } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import * as React from 'react';
import { useApi } from '@/hooks/useApi';
import { Message } from '@monorepo/types';
import { Dialog } from '@monorepo/types';
import Loader from '@/components/ui/loader';
import { formatDate, formatTime } from '@/utils/date';
import DashboardBackButton from '@/components/ui/dashboardBackButton';
import { RegisterRoleEnum } from '@monorepo/types';
import { TOKEN_PARAMS } from '@/constants/tokens-params';

const MessageCenter = () => {
    const { user, refreshUser } = useAuth();
    const { toast } = useToast();
    const [selectedDialog, setSelectedDialog] = useState<Dialog | null>(null);
    const [messageText, setMessageText] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const { request: sendMessageRequest } = useApi<Message>();
    const { request: loadDialogs } = useApi<Dialog[]>();
    const { loading: loadingDialogsStart, data: dataDialogsStart, request: loadDialogsStart } = useApi<Dialog[]>();
    const [dialogs, setDialogs] = useState<Dialog[]>([]);
    const { loading: loadingMessagesClickDialog, request: loadMessagesClickDialog } = useApi<Message[]>();
    const { loading: loadingMessagesUpdate, request: loadMessagesUpdate } = useApi<Message[]>();
    const [messages, setMessages] = useState<Message[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { request: markAsRead } = useApi();

    // const filteredConversations = mockConversations.filter((conversation) =>
    //     conversation.representative.name.toLowerCase().includes(searchQuery.toLowerCase()),
    // );

    // Загрузка диалогов при монтировании компонента
    useEffect(() => {
        const fetchDialogs = async () => {
            const response = await loadDialogsStart({
                method: 'GET',
                url: '/api/v1/dialogs',
            });

            if (response) {
                setDialogs(response);
            }
        };

        fetchDialogs();
    }, []);

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

                // если диалог не выбран — дальше ничего не делаем
                if (!selectedDialog?.id) return;

                // 2️⃣ Обновляем сообщения выбранного диалога
                const newMessages = await loadMessagesUpdate({
                    method: 'GET',
                    url: `/api/v1/dialogs/${selectedDialog.id}/messages`,
                });

                if (newMessages) {
                    setMessages((prev) => {
                        if (prev.length === newMessages.length) {
                            return prev;
                        }

                        setTimeout(scrollToBottom, 100);
                        return newMessages;
                    });
                }

                // 3️⃣ Автоматически помечаем как прочитанное
                await markAsRead({
                    method: 'PATCH',
                    url: `/api/v1/dialogs/${selectedDialog.id}/read`,
                });
            } catch (e) {
                console.log('Ошибка автообновления', e);
            }
        }, 10000); // один общий интервал (10 сек)

        return () => clearInterval(interval);
    }, [selectedDialog?.id]);

    const hasDialogs = dialogs && dialogs.length > 0;
    const hasSubscriptions = user.subscriptions.length > 0;

    const handleSendMessage = async () => {
        if (!messageText.trim()) return;

        if (user.voterProfile !== null && user.voterProfile.balance < TOKEN_PARAMS.MESSAGE_CREATION_PRICE) {
            toast({
                title: 'Ошибка',
                description: 'Недостаточно билетов на балансе',
                variant: 'destructive',
            });

            return;
        }

        try {
            if (selectedDialog.id) {
                // обычная отправка когда диалог уже есть
                const newMessage = await sendMessageRequest({
                    method: 'POST',
                    url: `/api/v1/dialogs/${selectedDialog.id}/messages`,
                    data: { text: messageText },
                });

                // для оновления баланса
                if (newMessage) {
                    await refreshUser();
                }

                setMessages((prev) => [...prev, newMessage]);

                // ВАЖНО: обновляем список диалогов
                setDialogs((prev) => {
                    const updatedDialogs = prev.map((d) =>
                        d.id === selectedDialog.id ? { ...d, updatedAt: new Date().toISOString() } : d,
                    );

                    // сортируем по updatedAt
                    return updatedDialogs.sort(
                        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
                    );
                });
            } else {
                // создание нового диалога
                const result = await sendMessageRequest({
                    method: 'POST',
                    url: `/api/v1/dialogs`,
                    data: { representativeId: selectedDialog.representative.id, text: messageText },
                });

                // для оновления баланса

                if (result) {
                    await refreshUser();
                }

                // Удаляем подписку (id: null) и добавляем новый диалог
                setDialogs((prev) => {
                    // Фильтруем: удаляем объект с id: null для этого представителя
                    const filteredDialogs = prev.filter(
                        (d) => !(d.id === null && d.representative?.id === selectedDialog.representative.id),
                    );

                    // Добавляем новый диалог в начало
                    return [result.dialog, ...filteredDialogs];
                });

                setSelectedDialog(result.dialog);
                setMessages([result.message]);
            }

            setMessageText('');
            setTimeout(scrollToBottom, 100);
        } catch {
            toast({
                title: 'Ошибка',
                description: 'Не удалось отправить сообщение',
                variant: 'destructive',
            });
        }
    };

    const handleSelectDialog = async (dialog: Dialog) => {
        // Если диалог уже активен — ничего не делаем
        const isSameDialog = dialog.id
            ? selectedDialog?.id === dialog.id
            : selectedDialog?.representative.id === dialog.representative.id;

        if (isSameDialog) return;

        setSelectedDialog(dialog);
        setMessages([]);
        setMessageText('');

        if (!dialog.id) return;

        try {
            // Загружаем сообщения
            const result = await loadMessagesClickDialog({
                method: 'GET',
                url: `/api/v1/dialogs/${dialog.id}/messages`,
            });

            if (result) {
                setMessages(result);
            }

            // Помечаем как прочитанный и получаем обновлённый диалог
            const updatedDialog = await markAsRead({
                method: 'PATCH',
                url: `/api/v1/dialogs/${dialog.id}/read`,
            });

            // Обновляем локальный state
            setSelectedDialog(updatedDialog);

            // обновляем массив диалогов в state, чтобы иконка пропала в списке
            setDialogs((prev) => prev.map((d) => (d.id === updatedDialog.id ? updatedDialog : d)));

            setTimeout(scrollToBottom, 100);
        } catch (e) {
            console.log('Ошибка открытия диалога', e);
        }
    };

    const scrollToBottom = () => {
        // Вариант 1: прокрутка с плавной анимацией
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollTo({
                top: messagesEndRef.current.scrollHeight,
                behavior: 'smooth',
            });
        }

        // Вариант 2: мгновенная прокрутка (если не нужна анимация)
        // if (messagesEndRef.current) {
        //     messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        // }
    };

    // Возвращает собеседника (не текущего пользователя) в диалоге
    const getCompanion = (dialog: Dialog) => {
        return dialog.voter.id === user.id ? dialog.representative : dialog.voter;
    };

    // Проверяет, есть ли непрочитанные сообщения в диалоге для текущего пользователя
    const hasUnreadMessages = (dialog: Dialog) => {
        if (!dialog.messages?.length) return false;

        const lastMessage = dialog.messages[dialog.messages.length - 1];

        // если сообщение отправил текущий пользователь — оно не может быть unread
        if (lastMessage.senderId === user.id) return false;

        const lastMessageTime = new Date(lastMessage.createdAt).getTime();

        if (user.role === RegisterRoleEnum.VOTER) {
            if (!dialog.voterLastReadAt) return true;

            return lastMessageTime > new Date(dialog.voterLastReadAt).getTime();
        }

        if (user.role === RegisterRoleEnum.REPRESENTATIVE) {
            if (!dialog.representativeLastReadAt) return true;

            return lastMessageTime > new Date(dialog.representativeLastReadAt).getTime();
        }

        return false;
    };

    // Отправляет сообщение при нажатии Enter без Shift
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // Возвращает уникальный ключ диалога (id или временный ключ)
    const getDialogKey = (dialog: Dialog) => {
        return dialog.id ?? `${dialog.voter.id}-${dialog.representative.id}`;
    };

    return (
        <Layout>
            <div className="honor-container py-12">
                <h1 className="text-3xl font-bold mb-8 text-honor-darkGray">Центр сообщений</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sidebar with conversations */}
                    <div className="lg:col-span-1">
                        <Card className="honor-card h-[600px] flex flex-col">
                            {/* <div className="p-4 border-b">
                                <div className="relative mb-4">
                                    <Search
                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-honor-darkGray"
                                        size={18}
                                    />
                                    <Input
                                        className="pl-10 pr-4 py-2"
                                        placeholder="Поиск сообщений"
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                    />
                                </div>
                                <Button
                                    className="w-full honor-button-primary flex items-center justify-center"
                                    onClick={handleNewConversation}>
                                    <Plus
                                        size={18}
                                        className="mr-2"
                                    />
                                    Новое сообщение
                                </Button>
                            </div> */}
                            <div className="flex-1 overflow-y-auto">
                                {loadingDialogsStart ? (
                                    <Loader />
                                ) : (
                                    !hasDialogs &&
                                    !hasSubscriptions && (
                                        <div className="p-4 text-center text-honor-darkGray">
                                            {user?.isRepresentative ? (
                                                <>Нет активных диалогов</>
                                            ) : (
                                                <>Подпишитесь на представителя власти, чтобы начать общение</>
                                            )}
                                        </div>
                                    )
                                )}

                                {dialogs &&
                                    dialogs.map((dialog) => {
                                        const companion = getCompanion(dialog);
                                        const unread = hasUnreadMessages(dialog);
                                        const isSelected =
                                            selectedDialog && getDialogKey(selectedDialog) === getDialogKey(dialog);

                                        return (
                                            <button
                                                key={getDialogKey(dialog)}
                                                className={`w-full flex items-start p-4 transition-colors border-b ${
                                                    isSelected ? 'bg-honor-blue/10' : 'hover:bg-honor-gray'
                                                }`}
                                                onClick={() => handleSelectDialog(dialog)}>
                                                <Avatar className="justify-center items-centerh-12 w-12 mr-4">
                                                    <User size={24} />
                                                </Avatar>
                                                <div className="flex-1 text-left">
                                                    <div className="flex justify-between items-center">
                                                        <h3 className="font-medium truncate">
                                                            {companion.name}
                                                            {selectedDialog?.id === dialog.id ||
                                                                (unread && (
                                                                    <span className="ml-2 inline-block w-2 h-2 bg-honor-blue rounded-full"></span>
                                                                ))}
                                                        </h3>
                                                        {/* <span className="text-xs text-honor-darkGray">
                                                    {new Date(subscription.lastMessageDate).toLocaleDateString('ru-RU')}
                                                </span> */}
                                                    </div>
                                                    <p className="text-xs text-honor-darkGray mt-1">
                                                        {companion.representativeProfile?.position}
                                                    </p>
                                                    {/* <p className="text-sm text-honor-darkGray mt-1 truncate">
                                                {subscription.lastMessage}
                                            </p> */}
                                                </div>
                                            </button>
                                        );
                                    })}

                                {/* {!hasDialogs && !hasSubscriptions && (
                                    <div className="p-4 text-center text-honor-darkGray">
                                        Подпишитесь на представителя власти, чтобы начать общение
                                    </div>
                                )} */}

                                {/* {filteredConversations.length === 0 && (
                                    <div className="p-4 text-center text-honor-darkGray">Нет сообщений</div>
                                )} */}
                            </div>
                        </Card>
                    </div>

                    {/* Chat window */}
                    <div className="relative lg:col-span-2">
                        <DashboardBackButton />

                        <Card className="honor-card h-[600px] flex flex-col">
                            {selectedDialog ? (
                                (() => {
                                    const companion = getCompanion(selectedDialog);
                                    return (
                                        <>
                                            {/* Chat header */}
                                            <div className="p-4 border-b flex items-center">
                                                <Avatar className="justify-center items-center h-10 w-10 mr-3">
                                                    <User size={20} />
                                                </Avatar>
                                                <div>
                                                    {/* Используем companion для отображения имени и должности */}
                                                    <h2 className="font-bold">{companion.name}</h2>
                                                    <p className="text-xs text-honor-darkGray">
                                                        {companion.representativeProfile?.position}
                                                    </p>
                                                </div>
                                            </div>

                                            <>
                                                {/* Chat messages */}
                                                <div
                                                    ref={messagesEndRef}
                                                    className="flex-1 p-4 overflow-y-auto">
                                                    {/* Group messages by date */}
                                                    {loadingMessagesClickDialog ? (
                                                        <Loader />
                                                    ) : messages.length === 0 ? (
                                                        <div className="flex flex-col items-center justify-center h-full text-center">
                                                            <MessageSquare className="w-12 h-12 text-honor-darkGray/30 mb-3" />
                                                            <p className="text-honor-darkGray text-sm">
                                                                В вашем диалоге еще нет сообщений
                                                            </p>
                                                            <p className="text-honor-darkGray/50 text-xs mt-1">
                                                                Напишите первое сообщение
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        messages.map((message, index) => {
                                                            // Check if we need to show a date separator
                                                            const showDateHeader =
                                                                index === 0 ||
                                                                formatDate(message.createdAt) !==
                                                                    formatDate(messages[index - 1].createdAt);

                                                            return (
                                                                <React.Fragment key={message.id}>
                                                                    {showDateHeader && (
                                                                        <div className="text-center my-4">
                                                                            <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-honor-darkGray">
                                                                                {formatDate(message.createdAt)}
                                                                            </span>
                                                                        </div>
                                                                    )}

                                                                    <div
                                                                        className={`flex mb-4 ${message.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                                                                        {/* {message.senderId === user.id  && (
                                                                        <Avatar className="h-8 w-8 mr-2 mt-1">
                                                                            <User size={16} />
                                                                        </Avatar>
                                                                    )} */}

                                                                        <div
                                                                            className={`max-w-[70%] ${
                                                                                message.senderId === user.id
                                                                                    ? 'bg-honor-blue text-white rounded-tl-xl rounded-bl-xl rounded-tr-xl'
                                                                                    : 'bg-gray-100 text-honor-darkGray rounded-tr-xl rounded-br-xl rounded-tl-xl'
                                                                            } px-4 py-2`}>
                                                                            <p>{message.text}</p>
                                                                            <div
                                                                                className={`text-right text-xs mt-1 ${
                                                                                    message.senderId === user.id
                                                                                        ? 'text-white/70'
                                                                                        : 'text-honor-darkGray'
                                                                                }`}>
                                                                                {formatTime(message.createdAt)}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </React.Fragment>
                                                            );
                                                        })
                                                    )}
                                                </div>
                                            </>

                                            {/* Message input */}
                                            <div className="p-4 border-t">
                                                <div className="flex items-center">
                                                    <Textarea
                                                        className="flex-1 resize-none honor-input"
                                                        placeholder="Введите сообщение..."
                                                        value={messageText}
                                                        onChange={(e) => setMessageText(e.target.value)}
                                                        onKeyDown={handleKeyDown}
                                                        rows={2}
                                                    />
                                                    <Button
                                                        className="ml-3 honor-button-primary rounded-full h-10 w-10 flex items-center justify-center p-0"
                                                        onClick={handleSendMessage}>
                                                        <Send size={18} />
                                                    </Button>
                                                </div>
                                                <div className="text-xs text-honor-darkGray mt-2 flex items-center">
                                                    <Clock
                                                        size={12}
                                                        className="mr-1"
                                                    />
                                                    Стоимость отправки: 10 билетов
                                                </div>
                                            </div>
                                        </>
                                    );
                                })()
                            ) : (
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="text-center">
                                        <MessageSquare
                                            className="mx-auto mb-4 text-honor-blue"
                                            size={48}
                                        />
                                        <h2 className="text-xl font-bold mb-2">Выберите диалог</h2>
                                        <p className="text-honor-darkGray mb-4">
                                            Выберите диалог из списка слева или начните новый разговор
                                        </p>
                                    </div>
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default MessageCenter;
