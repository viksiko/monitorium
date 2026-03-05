export interface Dialog {
    id: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    representativeLastReadAt?: Date | string | null;
    voterLastReadAt?: Date | string | null;
    representative: Representative;
    representativeId?: string;
    voter: Voter;
    voterId?: string;
    messages?: Message[];
}

interface Representative {
    id: string;
    name: string;
    representativeProfile: {
        position: string;
    } | null;
}

interface RepresentativeProfile {
    position: string;
}

interface Voter {
    id: string;
    name?: string;
    representativeProfile?: null; // Добавляем representativeProfile с типом null, чтобы избежать ошибок при доступе к нему
}

export interface Message {
    id: string;
    senderId: string;
    text: string;
    createdAt: Date | string;
}

export type DialogAndSubscriptions = Dialog;

export type CreateDialog = {
    dialog: Dialog;
    message: Message;
};
