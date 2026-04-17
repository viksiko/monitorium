import { useEffect } from 'react';
import { useAuthStore } from '@/shared/stores/auth.store';
import { useQueryClient } from '@tanstack/react-query';
import { connectSocket, disconnectSocket } from './socketClient';
import { useToast } from '@/hooks/use-toast';

export const AuthSocketProvider = ({ children }: { children: React.ReactNode }) => {
    const accessToken = useAuthStore((s) => s.accessToken);
    const queryClient = useQueryClient();
    const { toast } = useToast();

    useEffect(() => {
        // Если нет токена доступа - отключаем сокет и выходим
        // Пользователь не авторизован, поэтому WebSocket соединение не нужно
        if (!accessToken) {
            disconnectSocket();
            return;
        }

        // Устанавливаем WebSocket соединение с переданным токеном для аутентификации
        const socket = connectSocket(accessToken);

        // Обработчик новых уведомлений
        // При получении события "notification:new" инвалидируем кэш React Query,
        // что вызывает автоматический перезапрос списка уведомлений с бэкенда
        const handler = (newNotification: { title: string }) => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });

            toast({
                title: 'У вас новое уведомление',
                description: newNotification?.title || '',
                variant: 'success',
            });
        };

        // Слушаем событие "notification:new" - приходит с бэкенда когда создается новое уведомление
        // Вызываем handler который обновляет UI
        socket.on('notification:new', handler);

        // Слушаем событие "connect" - срабатывает когда WebSocket успешно установил соединение
        // Используется для отладки и мониторинга состояния соединения
        socket.on('connect', () => {
            //⚠️ в режиме продакшен убрать
            console.log('✅ WebSocket: Connected successfully');
        });

        // Слушаем событие "disconnect" - срабатывает когда соединение разорвано
        // Может произойти при: потере сети, перезагрузке сервера, закрытии вкладки
        socket.on('disconnect', () => {
            //⚠️ в режиме продакшен убрать
            console.log('❌ WebSocket: Disconnected');
        });

        // Слушаем событие "connect_error" - срабатывает при ошибке подключения
        // Причины: неверный токен, сервер недоступен, CORS ошибки, таймаут
        socket.on('connect_error', (error) => {
            console.error('⚠️ WebSocket: Connection error:', error.message);
        });

        // Cleanup функция - выполняется при размонтировании компонента или изменении зависимостей
        // Отписываемся от всех событий и закрываем соединение для предотвращения утечек памяти
        return () => {
            disconnectSocket(); // Закрываем WebSocket соединение
            socket.off('notification:new', handler); // Удаляем обработчик новых уведомлений
            socket.off('connect'); // Удаляем обработчик успешного подключения
            socket.off('disconnect'); // Удаляем обработчик отключения
            socket.off('connect_error'); // Удаляем обработчик ошибок подключения
        };
    }, [accessToken, queryClient]); // Перезапускаем эффект при изменении токена или queryClient

    return children;
};
