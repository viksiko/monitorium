import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/shared/stores/auth.store';
import { useQueryClient } from '@tanstack/react-query';

type Props = {
    children: React.ReactNode;
};

// Надо будет переделать, возможно отказаться от этого хука полностью и сделать логику в useAuth.ts
export const AuthInit = ({ children }: Props) => {
    const setAccessToken = useAuthStore((state) => state.setAccessToken);
    const [loading, setLoading] = useState(true);
    const queryClient = useQueryClient();

    useEffect(() => {
        const refresh = async () => {
            try {
                const { data } = await api.post('/api/v1/auth/refresh');
                const { accessToken, userProfile } = data.data;

                setAccessToken(accessToken);
                queryClient.setQueryData(['user'], userProfile);
            } catch (err) {
                setAccessToken(null);
            } finally {
                setLoading(false);
            }
        };

        refresh();
    }, []);

    if (loading) return <div>Loading...</div>;

    return <>{children}</>;
};
