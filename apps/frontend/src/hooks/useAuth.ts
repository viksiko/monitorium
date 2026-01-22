import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
    RegisterData,
    LoginData,
    AuthResponse,
    User,
    OAuthData,
} from '@/types/auth';
import { useAuthStore } from '@/shared/stores/auth.store';

export const useRegister = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (
            data: RegisterData,
        ): Promise<{ data: { data: AuthResponse } }> =>
            api.post('/api/v1/auth/register', data),
        // onSuccess: (response) => {
        //     localStorage.setItem('token', response.data.data.token);
        //     queryClient.setQueryData(['user'], response.data.data.user);
        // },
    });
};

export const useLogin = () => {
    const queryClient = useQueryClient();
    const setAccessToken = useAuthStore((state) => state.setAccessToken);

    return useMutation({
        mutationFn: (
            data: LoginData,
        ): Promise<{ data: { data: AuthResponse } }> =>
            api.post('/api/v1/auth/login', data),
        onSuccess: (response) => {
            // localStorage.setItem('token', response.data.data.accessToken);
            const { accessToken, userProfile } = response.data.data;

            // 🔑 сохраняем accessToken в Zustand
            setAccessToken(accessToken);
            queryClient.setQueryData(['user'], userProfile);
        },
    });
};

export const useOAuthLogin = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (
            data: OAuthData,
        ): Promise<{ data: { data: AuthResponse } }> =>
            api.post('/auth/oauth', data),
        // onSuccess: (response) => {
        //     localStorage.setItem('token', response.data.data.token);
        //     queryClient.setQueryData(['user'], response.data.data.user);
        // },
    });
};

export const useUser = () =>
    useQuery({
        queryKey: ['user'],
        retry: false,
        staleTime: Infinity,
    });

// Пока не используется, возможно можно будет переделать по refresh
// export const useUser = () => {
//     return useQuery({
//         queryKey: ['user'],
//         queryFn: (): Promise<User> =>
//             api.get('/auth/profile').then((res) => res.data),
//         enabled: !!localStorage.getItem('token'),
//         retry: false,
//         staleTime: 5 * 60 * 1000, // 5 минут
//     });
// };

export const useLogout = () => {
    const queryClient = useQueryClient();
    const logoutStore = useAuthStore((s) => s.logout);

    return useMutation({
        mutationFn: (): Promise<void> =>
            api.post('/api/v1/auth/logout').then(() => undefined),
        onSuccess: () => {
            logoutStore();
            queryClient.setQueryData(['user'], null);
            queryClient.clear();
        },
    });
};
