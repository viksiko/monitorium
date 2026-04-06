/** @generated */

export interface UserResponseModel {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    role: unknown;
    isRepresentative: boolean;
    isVerified: boolean;
    isActive: boolean;
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
        // balance: number;
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
