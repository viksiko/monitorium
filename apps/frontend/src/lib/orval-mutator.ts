import type { AxiosRequestConfig } from 'axios';
import { api } from './api';

/**
 * Экземпляр HTTP-клиента для сгенерированного Orval-кода (React Query + axios).
 * Использует тот же axios, что и остальное приложение (credentials, токены, refresh).
 */
export const customInstance = <T>(config: AxiosRequestConfig, options?: AxiosRequestConfig): Promise<T> => {
    return api({
        ...config,
        ...options,
    }).then(({ data }) => data);
};

export default customInstance;
