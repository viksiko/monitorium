import { useEffect, useMemo, useState } from 'react';
import { YearTasksData } from '@monorepo/types';
import { TasksSummary } from '@/types/Interfaces';

// Считает суммарную статистику по массиву месяцев
function getTasksSummary(data: YearTasksData[] | undefined): TasksSummary {
    if (!data) {
        return {
            created: 0,
            planned: 0,
            completed: 0,
            inprogress: 0,
            rejected: 0,
        };
    }

    return data.reduce(
        (acc, item) => {
            acc.created += item.created;
            acc.planned += item.planned;
            acc.completed += item.completed;
            acc.inprogress += item.inprogress;
            acc.rejected += item.rejected;
            return acc;
        },
        {
            created: 0,
            planned: 0,
            completed: 0,
            inprogress: 0,
            rejected: 0,
        },
    );
}

// Группирует массив данных по годам
function groupByYear(data: YearTasksData[]) {
    return data.reduce(
        (acc, item) => {
            if (!acc[item.year]) {
                acc[item.year] = [];
            }
            acc[item.year].push(item);
            return acc;
        },
        {} as Record<number, YearTasksData[]>,
    );
}

// Формирует summary по годам
function getSummaryByYears(data: YearTasksData[]) {
    if (!data) return {};

    const grouped = groupByYear(data);
    const result: Record<number, TasksSummary> = {};

    for (const year in grouped) {
        result[year] = getTasksSummary(grouped[year]);
    }

    return result;
}

// ОСНОВНОЙ ХУК
export function useUserStatistics(data: YearTasksData[] | undefined) {
    const [selectedYear, setSelectedYear] = useState<number | null>(null);

    const summaryByYears = useMemo(() => getSummaryByYears(data || []), [data]);

    const years = useMemo(
        () =>
            Object.keys(summaryByYears)
                .map(Number)
                .sort((a, b) => b - a),
        [summaryByYears],
    );

    useEffect(() => {
        if (years.length > 0 && selectedYear === null) {
            setSelectedYear(years[0]);
        }
    }, [years]);

    const filteredData = useMemo(() => data?.filter((item) => item.year === selectedYear) || [], [data, selectedYear]);

    return {
        selectedYear,
        setSelectedYear,
        years,
        filteredData,
        summaryByYears,
    };
}
