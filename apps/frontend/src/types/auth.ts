export interface User {
    id: string;
    email: string;
    name?: string;
    phone?: string;
    district?: string;
    verified: boolean;
    isRepresentative: boolean;
    role: 'USER' | 'REPRESENTATIVE' | 'ADMIN';
    position?: string;
    party?: string;
    rating?: number;
    balance: number;
}

export interface RegisterData {
    email: string;
    password: string;
    name: string;
    phone?: string;
    district?: string;
    isRepresentative?: boolean;
    position?: string;
    party?: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface AuthResponse {
    userProfile: User;
    accessToken: string;
}

export interface OAuthData {
    provider: 'gosuslugi' | 'sber' | 'tinkoff';
    providerId: string;
    email: string;
    name?: string;
    phone?: string;
    verified?: boolean;
}
