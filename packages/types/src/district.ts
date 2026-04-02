import { TaskStatus } from "./task";

export interface District {
    id: string;
    name: string;
    mapId: number;
    areas?: Area[];
}

export interface Area {
    id: string;
    name: string;
}

export interface DistrictStats {
    id: string;
    name: string;
    areas: {
        id: string;
        name: string;
    }[];

    tasks: {
        id: string;
        title: string;
        status: TaskStatus;
        address: string;
        desiredResolutionDate: Date | null,
        createdAt: Date;
        assignee: { name: string } | null
    }[];

    users: {
        id: string;
        name: string | null;
        email: string;
        districtId: string | null;
        isVerified: boolean;
        representativeProfile: {
            id: string;
            position: string | null;
            party: string | null;
            rating: number;
            tasksTotal: number;
            tasksCompleted: number;
            attendance: number;
            lastActivity: Date | null;
        } | null;
    }[];
}