import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/shared/stores/auth.store';
import { useQueryClient } from '@tanstack/react-query';
import Loader from '@/components/ui/loader';

type Props = {
    children: React.ReactNode;
};

// Надо будет переделать, возможно отказаться от этого хука полностью и сделать логику в useAuth.ts
export const AuthInit = ({ children }: Props) => {
    const { accessToken, status } = useAuthStore((authState) => authState);
    const [loading, setLoading] = useState(true);
    const queryClient = useQueryClient();

    // useEffect(() => {
    //     const refresh = async () => {
    //         try {
    //             const { data } = await api.post('/api/v1/auth/refresh');
    //             const { accessToken } = data.data;

    //             setAccessToken(accessToken, 'fresh');
    //             // queryClient.setQueryData(['user'], userProfile);
    //         } catch (err) {
    //             setAccessToken(null, 'unauthorized');
    //         } finally {
    //             setLoading(false);
    //         }
    //     };

    //     refresh();
    // }, []);

    // if (loading)
    //     return (
    //         <>
    //             <Loader />
    //         </>
    //     );

    return <>{children}</>;
};
