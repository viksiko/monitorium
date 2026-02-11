import { useEffect, useState } from 'react';
import RepresentativeCard from './RepresentativeCard';
import { api } from '@/lib/api';
import Loader from '../ui/loader';

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

const RepresentativesList = () => {
    const [representatives, setRepresentatives] = useState<Representative[]>(
        [],
    );
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRepresentatives = async () => {
            try {
                const response = await api.get('/api/v1/users', {
                    params: {
                        role: 'representative',
                    },
                });

                setRepresentatives(response.data.data);
            } catch (error) {
                console.error('Ошибка загрузки представителей:', error);
                setRepresentatives([]);
            } finally {
                setLoading(false);
            }
        };

        fetchRepresentatives();
    }, []);

    if (loading) {
        return (
            <div className="text-center">
                <Loader />
            </div>
        );
    }

    if (representatives.length === 0) {
        return (
            <div className="honor-card text-center py-8">
                <p className="text-honor-darkGray">
                    По вашему запросу ничего не найдено
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {representatives.map((rep) => (
                <RepresentativeCard
                    key={rep.id}
                    representative={rep}
                />
            ))}
        </div>
    );
};

export default RepresentativesList;
