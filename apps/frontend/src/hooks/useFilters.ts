import { useState, useMemo } from 'react';

// type WithDistrict = {
//     district?: {
//         id: string;
//         name?: string;
//     };
//     author?: {
//         district?: {
//             id: string;
//             name?: string;
//         };
//     };
// };

// type WithTitle = {
//     title?: string;
// };

import { Post } from '@monorepo/types';
import { Task } from '@monorepo/types';

export const useFilters = <T extends Task & Post>(data: T[] = []) => {
    const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // уникальные округа

    // Было так. Но в некоторых местах нет поля district, а есть только author.district. Поэтому добавил проверку на оба варианта.
    //  const districts = useMemo(() => {
    //     return Array.from(new Map(data.map((item) => [item.district?.id, item.district])).values()).filter(Boolean);
    // }, [data]);
    const districts = useMemo(() => {
        return Array.from(
            new Map(
                data.map((item) => {
                    const district = item.district ?? item.author?.district;

                    return [district?.id, district];
                }),
            ).values(),
        ).filter(Boolean);
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
