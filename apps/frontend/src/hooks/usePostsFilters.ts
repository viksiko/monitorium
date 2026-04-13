import { Post } from '@monorepo/types';
import { useMemo, useState } from 'react';

export const usePostsFilters = (
    data: Post[] = [],
): {
    selectedDistrict: string | null;
    searchTerm: string;
    districts: Post['author']['district'][];
    filteredData: Post[];
    handleDistrictFilter: (districtId: string) => void;
    handleSearch: (value: string) => void;
    resetFilters: () => void;
} => {
    const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Уникальные округа (из author.district)
    const districts = useMemo(() => {
        return Array.from(
            new Map(
                data.map((item) => {
                    const district = item.author?.district;
                    return [district?.name, district];
                }),
            ).values(),
        ).filter(Boolean);
    }, [data]);

    // Фильтрация
    const filteredData = useMemo(() => {
        return data.filter((item) => {
            const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesDistrict = !selectedDistrict || item.author?.district?.id === selectedDistrict;

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
