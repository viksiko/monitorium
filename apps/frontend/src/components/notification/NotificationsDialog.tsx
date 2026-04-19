import { Link } from 'react-router-dom';
import {
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    Dialog,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Bell, X } from 'lucide-react';
import Loader from '../ui/loader';
import { useGetNotification, useReadAllNotifications, useReadNotification } from '@/lib/query/notificateion.query';
import { NotificationTypeMap } from '@monorepo/types';

const NotificationsDialog = () => {
    const { data: notifications, isLoading, isFetching, isError } = useGetNotification();
    const { mutate: readNotification } = useReadNotification();
    const { mutate: readAllNotification } = useReadAllNotifications();

    const handleReadNotification = (notificationId: string) => {
        readNotification(notificationId);
    };

    const handleReadAllNotifications = () => {
        readAllNotification();
    };

    const hasUnreadNotifications = notifications?.some((notification) => !notification.isRead) ?? false;

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative">
                    <Bell size={20} />
                    {hasUnreadNotifications && (
                        <span className="absolute -top-0 -right-0 flex items-center justify-center w-4 h-4 text-[10px] font-medium text-white bg-red-500 rounded-full">
                            {notifications?.filter((n) => !n.isRead).length}
                        </span>
                    )}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Подписки и уведомления</DialogTitle>
                    <DialogDescription>Управляйте подписками и просматривайте последние уведомления</DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <h3 className="text-sm font-medium">Последние уведомления:</h3>

                    <div className="mt-2 space-y-2">
                        {(isLoading || isFetching) && (
                            <p className="text-sm text-center py-4">
                                <Loader />
                            </p>
                        )}

                        {isError && <p className="text-sm text-red-500 text-center py-4">Ошибка</p>}

                        {!isLoading && !isError && notifications?.length === 0 && (
                            <p className="text-sm text-honor-darkGray text-center py-4">У вас пока нет уведомлений</p>
                        )}

                        <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
                            {!isLoading &&
                                !isError &&
                                notifications?.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`p-2 rounded flex justify-between items-center ${
                                            !notification.isRead ? 'bg-blue-50' : 'bg-honor-gray'
                                        }`}>
                                        <div className="flex justify-between items-start w-full">
                                            <div className="flex-1">
                                                {notification.type === NotificationTypeMap.NEW_SUBSCRIBER ? (
                                                    <div className="flex items-center gap-2 mt-0">
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {notification.title}:
                                                        </p>
                                                        <Link
                                                            to={`/profiles/${notification.subscriptionId}`}
                                                            className="text-sm text-gray-700 hover:text-blue-600 hover:underline">
                                                            {notification.subscription.subscriber.name.slice(0, 30)}
                                                            {notification.subscription.subscriber.name.length > 30 &&
                                                                '...'}
                                                        </Link>
                                                    </div>
                                                ) : notification.type === NotificationTypeMap.NEW_TASK_ASSIGNED ? (
                                                    <div className="flex items-center gap-2 mt-0">
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {notification.title}:
                                                        </p>
                                                        <Link
                                                            to={`/tasks/${notification.taskId}/edit`}
                                                            className="text-sm text-gray-700 hover:text-blue-600 hover:underline">
                                                            {notification.task.title.slice(0, 30)}
                                                            {notification.task.title.length > 30 && '...'}
                                                        </Link>
                                                    </div>
                                                ) : notification.type === NotificationTypeMap.TASK_STATUS_CHANGED ? (
                                                    <div className="flex items-center gap-2 mt-0">
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {notification.title}:
                                                        </p>
                                                        <Link
                                                            to={`/tasks/${notification.taskId}`}
                                                            className="text-sm text-gray-700 hover:text-blue-600 hover:underline">
                                                            {notification.task.title.slice(0, 30)}
                                                            {notification.task.title.length > 30 && '...'}
                                                        </Link>
                                                    </div>
                                                ) : notification.type === NotificationTypeMap.NEW_POST ? (
                                                    <div className="flex items-center gap-2 mt-0">
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {notification.title} от:
                                                        </p>
                                                        <Link
                                                            to={`/posts/${notification.postId}`}
                                                            className="text-sm text-gray-700 hover:text-blue-600 hover:underline">
                                                            {notification.post.author.name.slice(0, 30)}
                                                            {notification.post.author.name.length > 30 && '...'}
                                                        </Link>
                                                    </div>
                                                ) : (
                                                    // Для других типов (дефолтный вариант)
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {notification.title}
                                                    </p>
                                                )}

                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs text-gray-600">
                                                        {new Date(notification.createdAt).toLocaleDateString('ru-RU', {
                                                            day: 'numeric',
                                                            month: 'long',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                    </span>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                onClick={() => handleReadNotification(notification.id)}
                                                className="text-gray-400 hover:text-red-600">
                                                <X size={20} />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                    {notifications?.length > 0 && (
                        <div className="absolute right-6">
                            <Link
                                className="text-xs h-8 text-gray-400 hover:text-red-600"
                                to="#"
                                onClick={handleReadAllNotifications}>
                                Удалить все
                            </Link>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default NotificationsDialog;
