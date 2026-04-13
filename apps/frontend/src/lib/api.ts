import { useAuthStore } from '@/shared/stores/auth.store';
import { AuthResponse } from '@monorepo/types';
import axios, { AxiosError, AxiosResponse } from 'axios';

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
    timeout: 10000,
});

// Автоматически добавляем токен к запросам
api.interceptors.request.use((config) => {
    // console.log('BASE URL:', import.meta.env.VITE_API_URL); // разобраться почему undefined

    const authState = useAuthStore.getState();

    if (authState.accessToken) {
        config.headers.Authorization = `Bearer ${authState.accessToken}`;
    }

    return config;
});

/// BACKEND UNHEALTHY INTERCEPTOR
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 500) {
            return Promise.reject(new Error('Backend is unavailable. Please try again later.'));
        }
        return Promise.reject(error);
    },
);
/// REFRESH TOKEN INTERCEPTOR

// Этот promise используется для запуска refreshTokenPair в единственном экземпляре.
let sharedRefreshPromise: Promise<string> | null = null;

/**
 * Проверяет необходимость обновления, запускает refresh и обновляет authState.
 * Можно вызывать из interceptor при 401 и из refreshTokenMutation.
 * @returns Новый accessToken
 * @throws При ошибке обновления — вызывает logout и пробрасывает ошибку
 */
export async function refreshTokenPair(): Promise<string> {
    const authState = useAuthStore.getState();

    if (authState.status === 'unauthorized') {
        throw new Error('Cannot refresh: already unauthorized');
    }

    if (sharedRefreshPromise) {
        return sharedRefreshPromise;
    }

    sharedRefreshPromise = (async () => {
        try {
            // Этот вызов post перейдет внутри себя в интерсептор,
            // если ответ будет с ошибкой (например 401).
            // Поэтому в интерсепторе мы учитываем конкретный api-путь /api/v1/auth/refresh.
            // чтобы не зациклиться на обновлении токена при вызове refreshTokenPair.
            const response: AxiosResponse<{
                data: AuthResponse;
            }> = await api.post('/api/v1/auth/refresh');

            const { accessToken } = response.data.data;

            if (!accessToken) throw response;

            authState.setAccessToken(accessToken, 'fresh');

            return accessToken;
        } catch (refreshError) {
            console.warn('Refresh token failed');
            authState.logout();

            throw refreshError;
        } finally {
            sharedRefreshPromise = null;
        }
    })();

    return sharedRefreshPromise;
}

// Обрабатываем 401 ошибку:
// Если токен просрочен, то пытаемся обновить токен
// Если обновление токена успешно, то повторяем запрос с новым токеном
// Если обновление токена неуспешно, то явно разлогиниваемся и возвращаем ошибку
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const { response, config } = error;
        const authState = useAuthStore.getState();

        if (!response || response.status !== 401 || !config || authState.status === 'unauthorized') throw error;

        // Это важная проверка, чтобы не зациклиться на обновлении токена при вызове refreshTokenPair
        if (config.url?.includes('/auth/refresh')) throw error;

        try {
            const accessToken = await refreshTokenPair();

            config.headers.Authorization = `Bearer ${accessToken}`;
            return api(config);
        } catch (refreshError) {
            return Promise.reject(refreshError);
        }
    },
);
