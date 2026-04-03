import { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import { toast, useToast } from '@/hooks/use-toast';
import { mockDistricts } from '@/data/mockDistricts';

// Import refactored components
import MapFilters from '@/components/map/MapFilters';
import MapVisualization from '@/components/map/MapVisualization';
import DistrictsList from '@/components/map/DistrictsList';
import DistrictCard from '@/components/map/DistrictCard';
import RepresentativeCard from '@/components/map/RepresentativeCard';
import ComparisonTable from '@/components/map/ComparisonTable';
import { api } from '@/lib/api';
import { District } from '@monorepo/types';
import { useApi } from '@/hooks/useApi';

const Map = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
    const [representativeType, setRepresentativeType] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<string | null>(null);
    const [showProblems, setShowProblems] = useState(false);
    const [selectedRepresentative, setSelectedRepresentative] = useState<any | null>(null);
    const [districts, setDistricts] = useState([]);
    const { loading, error, request } = useApi<District[]>();

    useEffect(() => {
        request({ method: 'GET', url: '/api/v1/districts?areas=true' }).then(setDistricts);
    }, []);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const filteredDistricts = mockDistricts.filter(
        (district) =>
            district.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            district.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            district.representatives.some(
                (rep) =>
                    rep.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    rep.position.toLowerCase().includes(searchTerm.toLowerCase()),
            ),
    );

    const handleSelectDistrict = (name: string) => {
        setSelectedDistrict(name === selectedDistrict ? null : name);
        setSelectedRepresentative(null);
    };

    const selectedDistrictData = districts.find((d) => d.name === selectedDistrict);

    const handleRequestMeeting = (representativeId: number) => {
        toast({
            title: 'Запрос отправлен',
            description: 'Ваш запрос на встречу успешно отправлен',
        });
    };

    const handleSubscribe = (districtId: number) => {
        toast({
            title: 'Подписка оформлена',
            description: 'Вы подписались на обновления округа',
        });
    };

    const handleRepresentativeTypeChange = (value: string) => {
        setRepresentativeType(value === 'all' ? null : value);
    };

    const handleSortByChange = (value: string) => {
        setSortBy(value === 'none' ? null : value);
    };

    return (
        <Layout>
            <div className="honor-container py-12">
                <h1 className="text-3xl font-bold mb-2">Карта округов</h1>
                <p className="text-honor-darkGray mb-8">
                    Интерактивная карта избирательных округов с информацией о представителях власти
                </p>

                {/* <MapFilters
                    searchTerm={searchTerm}
                    onSearchChange={handleSearch}
                    onRepresentativeTypeChange={handleRepresentativeTypeChange}
                    onSortByChange={handleSortByChange}
                /> */}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <MapVisualization
                            selectedDistrict={selectedDistrict}
                            showProblems={showProblems}
                            onToggleProblems={() => setShowProblems(!showProblems)}
                            onSelectDistrict={handleSelectDistrict}
                        />
                    </div>

                    <div>
                        {selectedDistrict && selectedRepresentative ? (
                            <RepresentativeCard
                                representative={selectedRepresentative}
                                onBack={() => setSelectedRepresentative(null)}
                                onRequestMeeting={handleRequestMeeting}
                            />
                        ) : selectedDistrict && selectedDistrictData ? (
                            <DistrictCard
                                district={selectedDistrictData}
                                onDistrictSelect={setSelectedDistrict}
                                onSubscribe={handleSubscribe}
                                onSelectRepresentative={setSelectedRepresentative}
                            />
                        ) : (
                            <DistrictsList
                                districts={districts}
                                loading={loading}
                                error={error}
                                selectedDistrict={selectedDistrict}
                                onSelectDistrict={handleSelectDistrict}
                            />
                        )}
                    </div>
                </div>

                {/* Таблица сравнения представителей */}
                {/* {selectedDistrict && selectedDistrictData?.representatives.length > 1 && (
                    <ComparisonTable
                        representatives={selectedDistrictData.representatives}
                        onSelectRepresentative={setSelectedRepresentative}
                    />
                )} */}
            </div>
        </Layout>
    );
};

export default Map;
