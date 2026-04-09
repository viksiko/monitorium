import { MonthlyTaskData } from '@monorepo/types';

export function fillMissingMonths(data: MonthlyTaskData[]): MonthlyTaskData[] {
    const result: MonthlyTaskData[] = [];
    const map = new Map(data.map((item) => [item.name, item]));
    const monthNames = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

    for (let i = 0; i < 12; i++) {
        const name = monthNames[i];

        result.push({
            name,
            completed: map.get(name)?.completed || 0,
            created: map.get(name)?.created || 0,
        });
    }

    return result;
}
