export interface HealthCheckResponse {
    status: 'ok' | 'error';
    service: string;
}

export interface UserProfile {
    name: string;
    email: string;
    phone: string;
    role: string;
    isRepresentative: boolean;
}
