import { Badge } from '@/components/ui/badge';
import { PARTIES } from '@/constants/parties';

type PartyBadgeProps = {
    party?: string;
};

export const PartyLabel = ({ party }: PartyBadgeProps) => {
    const label = PARTIES.find((p) => p.value === party)?.label ?? 'Неизвестно';

    return <Badge className="bg-honor-blue">{label}</Badge>;
};
