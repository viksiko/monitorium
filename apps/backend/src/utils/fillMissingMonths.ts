import { YearTasksData } from '@monorepo/types';

export function fillMissingMonths(data: YearTasksData[]): YearTasksData[] {
    const result: YearTasksData[] = [];
    const map = new Map(data.map((item) => [item.month, item]));
    const monthNames = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

    for (let i = 0; i < 12; i++) {
        const month = monthNames[i];

        result.push({
            year: data[0]?.year || new Date().getFullYear(), // Если данных нет, используем текущий год
            month,
            created: map.get(month)?.created || 0,
            planned: map.get(month)?.planned || 0,
            completed: map.get(month)?.completed || 0,
            inprogress: map.get(month)?.inprogress || 0,
            rejected: map.get(month)?.rejected || 0,
            comments: map.get(month)?.comments || 0,
            likes: map.get(month)?.likes || 0,
        });
    }

    return result;
}
