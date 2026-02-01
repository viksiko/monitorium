import { useEffect, useState } from 'react';

export function useAuthorizedFetch<T>(
    url: string | null,
    accessToken?: string,
) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!url || !accessToken) return;

        const fetchData = async () => {
            try {
                setLoading(true);

                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${accessToken}`,
                    },
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error('Ошибка загрузки данных');
                }

                const json = await response.json();
                setData(json.data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Ошибка');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [url, accessToken]);

    return { data, loading, error };
}
