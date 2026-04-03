import { create } from 'zustand';

interface ToggleShowShortStatsState {
    isShortStatsVisible: boolean;
    toggleShowShortStats: () => void;
}

export const useToggleShowShortStats = create<ToggleShowShortStatsState>((set) => ({
    isShortStatsVisible: false,
    toggleShowShortStats: () =>
        set((state) => ({
            isShortStatsVisible: !state.isShortStatsVisible,
        })),
}));
