import { District } from './district';
import { RegisterRoleEnum } from './auth';

export interface User {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    role: Role;
    isRepresentative: boolean;
    isVerified: boolean;
    isActive: boolean;
    district: District | null;
    representativeProfile?: RepresentativeProfile | null;
    voterProfile?: VoterProfile | null;
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
    balance: number;
}

export interface RepresentativeProfile {
    id: string;
    position: string;
    party: string | null;
    bio?: string | null;
    rating: number;
    tasksTotal: number;
    tasksCompleted: number;
    attendance: number;
    lastActivity: Date | null;
}

// export interface Representative {
//     id: string;
//     name: string;
//     email: string;
//     role: 'REPRESENTATIVE';
//     isRepresentative: boolean;
//     isVerified: boolean;
//     district: District;
//     representativeProfile: {
//         id: string;
//         position: string;
//         party: string;
//         rating: number;
//         tasksTotal: number;
//         tasksCompleted: number;
//         attendance: number;
//         lastActivity: string | null;
//     };
// }

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

export interface YearTasksData {
    year: number;
    month: string;
    created: number;
    planned: number;
    completed: number;
    inprogress: number;
    rejected: number;
    comments: number;
    likes: number;
}

export interface SubscriptionUser {
    id: string;
    name: string;
    email: string;
    role: RoleType;

    representativeProfile: {
        position: string;
        party: string | null;
    } | null;
}

export interface SubscriberUser {
    id: string;
    name: string;
    email: string;
    role: RoleType;
}

export enum Role {
    VOTER = 'VOTER',
    REPRESENTATIVE = 'REPRESENTATIVE',
    ADMIN = 'ADMIN',
}

// для бэкэнда, что бы призма не ругалась
export type RoleType = keyof typeof Role;
