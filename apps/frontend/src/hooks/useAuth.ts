import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, refreshTokenPair } from '@/lib/api';
import { RegisterData, LoginData, AuthResponse, User, OAuthData } from '@monorepo/types';
import { useAuthStore } from '@/shared/stores/auth.store';
import { RegisterRoleEnum } from '@monorepo/types';

export const useRefreshToken = () => {
    return useMutation({
        mutationFn: (): Promise<string> => refreshTokenPair(),
    });
};

export const useRegister = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: RegisterData): Promise<{ data: RegisterData }> => api.post('/api/v1/auth/register', data),

        // onSuccess: (response) => {
        //   localStorage.setItem('token', response.data.data.token);
        //   queryClient.setQueryData(['user'], response.data.data.user);
        // },
    });
};

export const useLogin = () => {
    const queryClient = useQueryClient();
    const setAccessToken = useAuthStore((state) => state.setAccessToken);

    return useMutation({
        mutationFn: (data: LoginData): Promise<{ data: { data: AuthResponse } }> =>
            api.post('/api/v1/auth/login', data),
        onSuccess: (response) => {
            const { accessToken, userProfile } = response.data.data;

            if (!accessToken || !userProfile) {
                throw new Error('Login failed: invalid response');
            }

            setAccessToken(accessToken, 'fresh');
        },
    });
};

export const useOAuthLogin = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: OAuthData): Promise<{ data: { data: AuthResponse } }> => api.post('/auth/oauth', data),
        // onSuccess: (response) => {
        //     localStorage.setItem('token', response.data.data.token);
        //     queryClient.setQueryData(['user'], response.data.data.user);
        // },
    });
};

export const useUser = () => {
    const { accessToken, status } = useAuthStore((authState) => authState);

    return useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            console.log('FETCH USER 🔥');
            const { data } = await api.get('/api/v1/users/profile');
            return data.data;
        },
        enabled: status === 'fresh' && !!accessToken,
        retry: false,
        // TODO: привязать к значению получаемому из конфига или из запроса на сервер. Как лучше хз.
        staleTime: 5 * 60 * 1000,
    });
};

export const useLogout = () => {
    const queryClient = useQueryClient();
    const logoutStore = useAuthStore((authState) => authState.logout);

    return useMutation({
        mutationFn: (): Promise<void> => api.post('/api/v1/auth/logout').then(() => undefined),
        onSuccess: () => {
            logoutStore();
            // queryClient.setQueryData(['user'], null);
            queryClient.removeQueries({ queryKey: ['user'] });
            queryClient.clear();
        },
    });
};
