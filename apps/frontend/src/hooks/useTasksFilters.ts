// useFilters.ts

import { useState, useMemo } from 'react';
import { TaskListItem } from '@monorepo/types';

export const useTasksFilters = (
    data: TaskListItem[] = [],
): {
    selectedDistrict: string | null;
    searchTerm: string;
    districts: TaskListItem['district'][];
    filteredData: TaskListItem[];
    handleDistrictFilter: (districtId: string) => void;
    handleSearch: (value: string) => void;
    resetFilters: () => void;
} => {
    const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // уникальные округа
    const districts = useMemo(() => {
        return Array.from(new Map(data.map((item) => [item.district?.id, item.district])).values()).filter(Boolean);
    }, [data]);

    // фильтрация
    const filteredData = useMemo(() => {
        return data.filter((item) => {
            const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesDistrict = !selectedDistrict || item.district?.id === selectedDistrict;

            return matchesSearch && matchesDistrict;
        });
    }, [data, searchTerm, selectedDistrict]);

    // handlers
    const handleDistrictFilter = (districtId: string) => {
        setSelectedDistrict((prev) => (prev === districtId ? null : districtId));
    };

    const handleSearch = (value: string) => {
        setSearchTerm(value);
    };

    const resetFilters = () => {
        setSelectedDistrict(null);
        setSearchTerm('');
    };

    return {
        selectedDistrict,
        searchTerm,
        districts,
        filteredData,

        handleDistrictFilter,
        handleSearch,
        resetFilters,
    };
};
