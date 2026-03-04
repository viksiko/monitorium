export const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);

    return date.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
    });
};

export const formatDate = (timestamp: string): string => {
    const date = new Date(timestamp);

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
        return 'Сегодня';
    }

    if (date.toDateString() === yesterday.toDateString()) {
        return 'Вчера';
    }

    return date.toLocaleDateString('ru-RU');
};
