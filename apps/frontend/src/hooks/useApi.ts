import { useState, useCallback } from 'react';
import { AxiosRequestConfig } from 'axios';
import { api } from '@/lib/api';

export function useApi<T = unknown>() {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const request = useCallback(async (config: AxiosRequestConfig): Promise<T | null> => {
        try {
            setLoading(true);
            setError(null);

            const response = await api(config);
            setData(response.data.data);

            return response.data.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Something went wrong');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return { data, loading, error, request };
}
