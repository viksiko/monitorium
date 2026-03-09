import { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import { RepresentativesSearch, RepresentativesFilters, RepresentativesList } from '@/components/representatives';
import { api } from '@/lib/api';
import Loader from '@/components/ui/loader';
import { Representative } from '@monorepo/types';

const Representatives = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedParty, setSelectedParty] = useState('');
    const [representatives, setRepresentatives] = useState<Representative[]>([]);
    const [loading, setLoading] = useState(true);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleDistrictFilter = (district: string) => {
        setSelectedDistrict(selectedDistrict === district ? '' : district);
    };

    const handlePartyFilter = (party: string) => {
        setSelectedParty(selectedParty === party ? '' : party);
    };

    const resetFilters = () => {
        setSelectedDistrict('');
        setSelectedParty('');
    };

    useEffect(() => {
        const fetchRepresentatives = async () => {
            try {
                const response = await api.get('/api/v1/users/filter', {
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

    const filteredRepresentatives = representatives.filter((rep) => {
        const matchesSearch =
            rep.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            rep.representativeProfile.party.toLowerCase().includes(searchTerm.toLowerCase()) ||
            rep.district.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesDistrict = selectedDistrict === '' || rep.district === selectedDistrict;
        const matchesParty = selectedParty === '' || rep.representativeProfile.party === selectedParty;

        return matchesSearch && matchesDistrict && matchesParty;
    });

    // Get unique districts and parties for filters
    const districts = Array.from(new Set(representatives.map((rep) => rep.district)));
    const parties = Array.from(new Set(representatives.map((rep) => rep.representativeProfile.party)));

    return (
        <Layout>
            <div className="honor-container py-12">
                <h1 className="text-3xl font-bold mb-2">Представители власти</h1>
                <p className="text-honor-darkGray mb-8">Список представителей власти с информацией о их деятельности</p>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Filters sidebar */}
                    <div className="lg:col-span-1">
                        <RepresentativesFilters
                            districts={districts}
                            parties={parties}
                            selectedDistrict={selectedDistrict}
                            selectedParty={selectedParty}
                            handleDistrictFilter={handleDistrictFilter}
                            handlePartyFilter={handlePartyFilter}
                            resetFilters={resetFilters}
                        />
                    </div>

                    {/* Main content */}
                    <div className="lg:col-span-3">
                        <RepresentativesSearch
                            searchTerm={searchTerm}
                            handleSearch={handleSearch}
                        />
                        {loading ? <Loader /> : <RepresentativesList representatives={filteredRepresentatives} />}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Representatives;
