import { useState, useMemo } from 'react';

interface UseShowMoreOptions {
    initialShowAll?: boolean;
    defaultItemsCount?: number;
}

interface UseShowMoreReturn<T> {
    showAll: boolean;
    displayedItems: T[];
    shouldShowButton: boolean;
    remainingCount: number;
    handleShowAll: () => void;
    handleCollapse: () => void;
    toggleShowAll: () => void;
}

export function useShowMore<T>(items: T[], options: UseShowMoreOptions = {}): UseShowMoreReturn<T> {
    const { initialShowAll = false, defaultItemsCount = 5 } = options;

    const [showAll, setShowAll] = useState(initialShowAll);

    const displayedItems = useMemo(() => {
        if (!items || items.length === 0) return [];
        return showAll ? items : items.slice(0, defaultItemsCount);
    }, [items, showAll, defaultItemsCount]);

    const shouldShowButton = items.length > defaultItemsCount;
    const remainingCount = items.length - defaultItemsCount;

    const handleShowAll = () => setShowAll(true);
    const handleCollapse = () => setShowAll(false);
    const toggleShowAll = () => setShowAll((prev) => !prev);

    return {
        showAll,
        displayedItems,
        shouldShowButton,
        remainingCount,
        handleShowAll,
        handleCollapse,
        toggleShowAll,
    };
}
