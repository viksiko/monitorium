import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
    RegisterData,
    LoginData,
    AuthResponse,
    User,
    OAuthData,
} from '@/types/auth';

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

    return useMutation({
        mutationFn: (
            data: LoginData,
        ): Promise<{ data: { data: AuthResponse } }> =>
            api.post('/api/v1/auth/login', data),
        onSuccess: (response) => {
            localStorage.setItem('token', response.data.data.accessToken);
            queryClient.setQueryData(['user'], response.data.data.userProfile);
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

export const useUser = () => {
    return useQuery({
        queryKey: ['user'],
        queryFn: (): Promise<User> =>
            api.get('/auth/profile').then((res) => res.data),
        enabled: !!localStorage.getItem('token'),
        retry: false,
        staleTime: 5 * 60 * 1000, // 5 минут
    });
};

export const useLogout = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            localStorage.removeItem('token');
            queryClient.setQueryData(['user'], null);
            queryClient.clear();
        },
        onSuccess: () => {
            window.location.href = '/login';
        },
    });
};
