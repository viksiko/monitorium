import { Button } from '@/components/ui/button';
import { MapPin, Award } from 'lucide-react';
import { formatPartyName } from '@/utils/formatPartyName';

interface RepresentativesFiltersProps {
    districts: string[];
    parties: string[];
    selectedDistrict: string;
    selectedParty: string;
    handleDistrictFilter: (district: string) => void;
    handlePartyFilter: (party: string) => void;
    resetFilters: () => void;
}

const RepresentativesFilters = ({
    districts,
    parties,
    selectedDistrict,
    selectedParty,
    handleDistrictFilter,
    handlePartyFilter,
    resetFilters,
}: RepresentativesFiltersProps) => {
    return (
        <div className="honor-card mb-6">
            <h3 className="text-lg font-semibold mb-4">Фильтры</h3>

            <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Округ/Район</label>
                <div className="space-y-2">
                    {districts.map((district) => (
                        <button
                            key={district}
                            onClick={() => handleDistrictFilter(district)}
                            className={`flex items-center w-full text-left px-3 py-2 rounded-lg text-sm ${
                                selectedDistrict === district
                                    ? 'bg-honor-blue text-white'
                                    : 'hover:bg-honor-gray text-honor-darkGray'
                            }`}>
                            <MapPin
                                size={16}
                                className="mr-2"
                            />
                            {district}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Партия</label>
                <div className="space-y-2">
                    {parties.map((party) => (
                        <button
                            key={party}
                            onClick={() => handlePartyFilter(party)}
                            className={`flex items-center w-full text-left px-3 py-2 rounded-lg text-sm ${
                                selectedParty === party
                                    ? 'bg-honor-blue text-white'
                                    : 'hover:bg-honor-gray text-honor-darkGray'
                            }`}>
                            <Award
                                size={16}
                                className="mr-2"
                            />
                            {formatPartyName(party)}
                        </button>
                    ))}
                </div>
            </div>

            <Button
                className="w-full honor-button-secondary"
                onClick={resetFilters}>
                Сбросить фильтры
            </Button>
        </div>
    );
};

export default RepresentativesFilters;
