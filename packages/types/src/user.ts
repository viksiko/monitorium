export interface Representative {
    id: string;
    name: string;
    email: string;
    role: 'REPRESENTATIVE';
    isRepresentative: boolean;
    isVerified: boolean;
    district: string | null;
    representativeProfile: {
        id: string;
        position: string;
        party: string;
        rating: number;
        tasksTotal: number;
        tasksCompleted: number;
        attendance: number;
        lastActivity: string | null;
    };
}
