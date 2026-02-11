import { RegisterRoleEnum } from '@monorepo/types';

export interface User {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    role: 'VOTER' | 'REPRESENTATIVE' | 'ADMIN';
    isRepresentative: boolean;
    isVerified: boolean;

    representativeProfile?: {
        id: string;
        position: string;
        party: string | null;
        bio?: string | null;
        rating: number;
        tasksTotal: number;
        tasksCompleted: number;
        attendance: number;
        lastActivity: Date | null;
    } | null;

    voterProfile?: {
        id: string;
        balance: number;
    } | null;

    subscriptions: Array<{
        id: string;
        createdAt: Date;
        representative: {
            id: string;
            name: string;
            representativeProfile: {
                id: string;
                position: string;
                party: string | null;
                rating: number;
            } | null;
        };
    }>;
}

export interface VoterProfile {
    id: string;
    userId: string;
    balance: number;

    // Таймстампы
    createdAt: Date;
    updatedAt: Date;

    // Отношения
    user?: User;
}

export interface RepresentativeProfile {
    id: string;
    attendance: number;
    lastActivity: string | null;
    party: string;
    position: string;
    rating: number;
    tasksCompleted: number;
    tasksTotal: number;
}

export interface Subscription {
    id: string;
    subscriber: string;
    representative: string;
    createdAt: Date;

    // Отношения
    voterProfile?: VoterProfile;
    representativeProfile?: RepresentativeProfile;
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
    role: RegisterRoleEnum;
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
