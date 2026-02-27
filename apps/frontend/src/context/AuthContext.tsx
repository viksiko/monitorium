import { createContext, useContext, ReactNode, useEffect, useCallback } from 'react';
import { useUser, useLogin, useRegister, useLogout, useOAuthLogin, useRefreshToken } from '@/hooks/useAuth';
import { User, RegisterData, LoginData, OAuthData } from '@/types/auth';
import { useToast } from '@/components/ui/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { RegisterRoleEnum } from '@monorepo/types';
import { useAuthStore } from '@/shared/stores/auth.store';

interface AuthContextType {
    user: User | null | undefined;
    loading: boolean;
    isAuthenticated: boolean;
    refreshToken: () => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    register: (data: RegisterData) => Promise<any>;
    logout: () => void;
    loginWithGosuslugi: () => void;
    loginWithSber: () => void;
    loginWithTinkoff: () => void;
    isVerified: () => boolean;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { accessToken, status, setAccessToken } = useAuthStore((authState) => authState);
    const refreshTokenMutation = useRefreshToken();
    const { data: user, isLoading: loading, isError, error } = useUser();
    const queryClient = useQueryClient();
    const loginMutation = useLogin();
    const registerMutation = useRegister();
    const oauthMutation = useOAuthLogin();
    const logoutMutation = useLogout();
    const { toast } = useToast();

    // Используем для первоначального запроса токена при загрузке страницы.
    // Потому что accessToken может быть undefined и токен просрочен.
    useEffect(() => {
        refreshToken();
    }, []);

    const refreshToken = useCallback(async () => {
        if (status === 'unauthorized' || (status === 'fresh' && accessToken)) return;

        if (status && user) return;

        // Если есть ошибка получения профиля пользователя, то токен ВОЗМОЖНО просрочен.

        // TODO: Сделать проверку актуальности токена по специальному методу проверки токена, а
        // не по ошибкам получения юзера (потому что они могут быть иного рода)

        try {
            await refreshTokenMutation.mutateAsync();
            toast({
                title: 'Токен обновлен',
                description: 'Токен успешно обновлен.',
                variant: 'success',
            });
        } catch (error) {
            console.error('Refresh token failed', error);
            toast({
                title: 'Ошибка обновления токена',
                description: 'Произошла ошибка при обновлении токена.',
                variant: 'destructive',
            });
        }
    }, [status, accessToken, user, refreshTokenMutation, toast]);

    const login = async (email: string, password: string) => {
        try {
            await loginMutation.mutateAsync({ email, password });
            toast({
                title: 'Вход выполнен!',
                description: 'Вы успешно вошли в систему.',
                variant: 'success',
            });
        } catch (error: any) {
            toast({
                title: 'Ошибка входа',
                description: error.response?.data?.message || 'Неверный email или пароль.',
                variant: 'destructive',
            });
            throw error;
        }
    };

    const register = async (data: RegisterData) => {
        try {
            const result = await registerMutation.mutateAsync(data);

            toast({
                title: 'Код подтверждения отправлен',
                description: 'Мы отправили код подтверждения на указанный вами email',
                variant: 'success',
            });
            return result;
        } catch (error: any) {
            console.error('Ошибка регистрации:', error);
            toast({
                title: 'Ошибка регистрации',
                description: error.response?.data?.data.message || 'Произошла ошибка при регистрации.',
                variant: 'destructive',
            });
            throw error;
        }
    };

    const loginWithGosuslugi = async () => {
        // В реальном приложении здесь был бы редирект на OAuth Госуслуги
        // Пока что заглушка
        toast({
            title: 'OAuth Госуслуги',
            description: 'Функция в разработке',
            variant: 'default',
        });
    };

    const loginWithSber = async () => {
        // В реальном приложении здесь был бы редирект на OAuth Сбер ID
        toast({
            title: 'OAuth Сбер ID',
            description: 'Функция в разработке',
            variant: 'default',
        });
    };

    const loginWithTinkoff = async () => {
        // В реальном приложении здесь был бы редирект на OAuth Тинькофф ID
        toast({
            title: 'OAuth Тинькофф ID',
            description: 'Функция в разработке',
            variant: 'default',
        });
    };

    const logout = () => {
        logoutMutation.mutate();
        toast({
            title: 'Выход выполнен',
            description: 'Вы вышли из системы.',
            variant: 'default',
        });
    };

    const isVerified = () => {
        return user?.verified || false;
    };

    const refreshUser = async () => {
        await queryClient.invalidateQueries({
            queryKey: ['user'],
        });
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isAuthenticated: !!user,
                refreshToken,
                login,
                register,
                logout,
                loginWithGosuslugi,
                loginWithSber,
                loginWithTinkoff,
                isVerified,
                refreshUser,
            }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const auth = useContext(AuthContext);
    if (auth === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return auth;
};
