import { useAuthStore } from '@/shared/stores/auth.store';
import { AuthResponse } from '@/types/auth';
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

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

/// REFRESH TOKEN INTERCEPTOR

/**
 * Обновляет пару токенов (access и refresh)
 * @returns Новый accessToken
 * @throws Error, если обновление токена неуспешно
 */
async function refreshTokenPair(): Promise<string> {
    const response: AxiosResponse<{
        data: AuthResponse;
    }> = await api.post('/api/v1/auth/refresh');

    const { accessToken } = response.data.data;

    return accessToken || Promise.reject(response);
}

let sharedRefreshPromise: Promise<string> | null = null;
/**
 * Возвращает sharedRefreshPromise, если он уже существует, иначе создает новый
 * @returns Новый accessToken
 */
async function getOrRunRefreshPromise(): Promise<{ accessToken: string; isFirstCaller: boolean }> {
    if (sharedRefreshPromise) {
        return { accessToken: await sharedRefreshPromise, isFirstCaller: false };
    }
    sharedRefreshPromise = refreshTokenPair().finally(() => {
        sharedRefreshPromise = null;
    });

    return { accessToken: await sharedRefreshPromise, isFirstCaller: true };
}

/**
 * Проверяет необходимость обновления, запускает refresh и обновляет authState.
 * Можно вызывать из interceptor при 401 и из refreshTokenMutation.
 * @returns Новый accessToken
 * @throws При ошибке обновления — вызывает logout и пробрасывает ошибку
 */
export async function ensureRefreshedToken(): Promise<string> {
    const authState = useAuthStore.getState();

    if (authState.status === 'unauthorized') {
        return Promise.reject(new Error('Cannot refresh: already unauthorized'));
    }

    try {
        const { accessToken, isFirstCaller } = await getOrRunRefreshPromise();

        if (isFirstCaller) {
            authState.setAccessToken(accessToken, 'fresh');
        }

        return accessToken;
    } catch (refreshError) {
        console.warn('Refresh token failed');
        authState.logout();
        throw refreshError;
    }
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

        if (!response || response.status !== 401 || !config || authState.status === 'unauthorized')
            return Promise.reject(error);

        // Это важная проверка, чтобы не зациклиться на обновлении токена при вызове refreshTokenPair
        if (config.url?.includes('/auth/refresh')) return Promise.reject(error);

        try {
            const accessToken = await ensureRefreshedToken();

            config.headers.Authorization = `Bearer ${accessToken}`;
            return api(config);
        } catch (refreshError) {
            return Promise.reject(refreshError);
        }
    },
);
