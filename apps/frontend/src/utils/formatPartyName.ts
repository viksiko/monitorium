import { PARTIES } from '@/constants/parties';

export const formatPartyName = (party: string): string => {
    const name = PARTIES.find((p) => p.value === party)?.label ?? 'Неизвестно';
    return name;
};
