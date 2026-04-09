import { District } from './district';

export interface Representative {
    id: string;
    name: string;
    email: string;
    role: 'REPRESENTATIVE';
    isRepresentative: boolean;
    isVerified: boolean;
    district: District;
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

export interface MonthlyTaskData {
    name: string;
    completed: number;
    created: number;
}
