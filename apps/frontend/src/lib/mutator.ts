import type { AxiosRequestConfig } from 'axios';
import { api } from '@/lib/api';

/**
 * Mutator для сгенерированного Nest-клиента (как в Orval).
 * Использует тот же `api`, что и остальное приложение: baseURL, Bearer, refresh на 401.
 */
export function customInstance<T>(config: AxiosRequestConfig, options?: AxiosRequestConfig): Promise<T> {
    return api({
        ...config,
        ...options,
    }).then(({ data }) => data?.data);
}
