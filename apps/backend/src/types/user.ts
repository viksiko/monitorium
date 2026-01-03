import { Role as PrismaRole } from '@prisma/client';

export { Role } from '@prisma/client';

export interface User {
    id: string;
    email: string;
    phone: string | null;
    gosuslugiId: string | null;
    sberId: string | null;
    tinkoffId: string | null;
    password: string | null;
    name: string;
    district: string | null;
    isVerified: boolean;
    isRepresentative: boolean;
    role: PrismaRole;
    position: string | null;
    party: string | null;
    rating: number | null;
    tasksTotal: number;
    tasksCompleted: number;
    attendance: number | null;
    lastActivity: Date | null;
    balance: number;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
    deletedAt: Date | null;
}

export type UserResponse = Pick<User, 'id' | 'name' | 'email' | 'role'>;
