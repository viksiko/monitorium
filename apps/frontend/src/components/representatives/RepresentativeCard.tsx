import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, MapPin, ThumbsUp, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Representative {
    id: string;
    name: string;
    email: string;
    role: 'REPRESENTATIVE';
    isRepresentative: boolean;
    isVerified: boolean;
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

interface RepresentativeCardProps {
    representative: Representative;
}

const RepresentativeCard = ({ representative }: RepresentativeCardProps) => {
    return (
        <Link to={`/representative/profile/${representative.id}`}>
            <Card className="honor-card hover:shadow-lg transition-shadow">
                <div className="flex items-start">
                    <Avatar className="h-16 w-16 mr-4">
                        <User size={32} />
                    </Avatar>

                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-bold">{representative.name}</h3>
                                <p className="text-honor-darkGray">{representative.role}</p>

                                <div className="flex items-center space-x-4 mt-1">
                                    <div className="flex items-center text-sm text-honor-darkGray">
                                        <MapPin
                                            size={14}
                                            className="mr-1"
                                        />
                                        {/* <span>
                                            {
                                                representative
                                                    .representativeProfile
                                                    .position
                                            }
                                        </span> */}
                                    </div>
                                    <Badge className="bg-honor-blue">
                                        {representative.representativeProfile.party}
                                    </Badge>
                                </div>
                            </div>

                            <div className="text-lg font-bold text-honor-blue">
                                {representative.representativeProfile.rating}
                                <span className="text-xs text-honor-darkGray ml-1">рейтинг</span>
                            </div>
                        </div>

                        <div className="mt-4 flex justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center">
                                    <ThumbsUp
                                        size={16}
                                        className="text-honor-blue mr-1"
                                    />
                                    <span className="text-sm">
                                        {representative.representativeProfile.tasksTotal} задач
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <CheckCircle
                                        size={16}
                                        className="text-green-500 mr-1"
                                    />
                                    <span className="text-sm">
                                        {representative.representativeProfile.tasksCompleted} выполнено
                                    </span>
                                </div>
                            </div>

                            <Button
                                variant="link"
                                className="p-0 h-auto text-honor-blue">
                                Подробнее
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>
        </Link>
    );
};

export default RepresentativeCard;
