import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notification } from '../generated';
import { Notification as INotification } from '@monorepo/types';

export const useGetNotification = () => {
    return useQuery({
        queryKey: ['notifications'],
        queryFn: () => notification.getNotifications(),
    });
};

export const useReadNotification = () => {
    const queryClient = useQueryClient();

    return useMutation({
        // Отправляет запрос на backend: "пометить уведомление как прочитанное"
        mutationFn: (id: string) => notification.readNotification(id),

        // Optimistic update — выполняется ДО запроса на сервер
        onMutate: async (id) => {
            // Останавливаем все текущие запросы notifications чтобы они не перезаписали наш optimistic update
            await queryClient.cancelQueries({ queryKey: ['notifications'] });

            // Сохраняем предыдущее состояние кэша (на случай отката)
            const prev = queryClient.getQueryData(['notifications']);

            // Обновляем кэш вручную (мгновенно меняем UI)
            queryClient.setQueryData(['notifications'], (old: INotification[] = []) =>
                old.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
            );

            // Возвращаем предыдущее состояние, чтобы можно было откатить при ошибке
            return { prev };
        },

        // Если запрос на сервер упал (ошибка)
        onError: (_err, _id, context) => {
            queryClient.setQueryData(['notifications'], context?.prev);
        },

        // после успеха — синхронизируем с сервером
        // ⚠️ без этого тоже обновляется список уведомлений, но лучше оставить пока. Потом перепроверить!
        onSuccess: () => {
            // "данные ['notifications'] устарели", инвалидируем кэш → React Query делает новый запрос и синхронизирует данные с сервером
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
};

export const useReadAllNotifications = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => notification.readAllNotifications(),

        // 🚀 optimistic update
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ['notifications'] });

            const prev = queryClient.getQueryData(['notifications']);

            // 👇 помечаем ВСЕ как прочитанные
            queryClient.setQueryData(['notifications'], (old: INotification[] = []) =>
                old.map((n) => ({ ...n, isRead: true })),
            );

            return { prev };
        },

        // ❌ откат если ошибка
        onError: (_err, _variables, context) => {
            queryClient.setQueryData(['notifications'], context?.prev);
        },

        // 🔄 синхронизация с сервером
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
};
