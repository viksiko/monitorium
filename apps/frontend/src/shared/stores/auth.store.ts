import { create } from 'zustand';

type AuthStatus = undefined | 'fresh' | 'unauthorized';

export type AuthState = {
    accessToken: string | null;
    status: AuthStatus;
    setAccessToken: (token: string | null, status: AuthStatus) => void;
    logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
    accessToken: null,
    status: undefined,

    setAccessToken: (accessToken, status) => set({ accessToken, status }),

    logout: () => set({ accessToken: null, status: 'unauthorized' }),
}));
