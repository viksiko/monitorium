import { MapPin } from 'lucide-react';

interface DistrictsListProps {
    districts: any[];
    loading: boolean;
    error: string | null;
    selectedDistrict: string | null;
    onSelectDistrict: (name: string) => void;
}

const DistrictsList = ({ districts, loading, error, selectedDistrict, onSelectDistrict }: DistrictsListProps) => {
    return (
        <div className="honor-card h-full">
            <h2 className="text-xl font-bold mb-4">Избирательные округа</h2>
            <p className="text-honor-darkGray mb-6">Выберите округ из списка для получения подробной информации</p>

            <div className="relative">
                {/* Иконка внутри селекта для сохранения стиля */}
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <MapPin
                        className="text-honor-blue"
                        size={20}
                    />
                </div>
                {/* 
                <select
                    className="w-full pl-10 pr-4 py-3 border rounded-xl bg-white focus:ring-2 focus:ring-honor-blue focus:border-honor-blue outline-none appearance-none transition-all cursor-pointer text-honor-darkGray"
                    value={selectedDistrict || ''}
                    onChange={(e) => onSelectDistrict(e.target.value)}>
                    <option
                        value=""
                        disabled>
                        Выберите округ...
                    </option>
                    {districts.map((district) => (
                        <option
                            key={district.id}
                            value={district.name}>
                            {district.name}
                        </option>
                    ))}
                </select> */}

                <select
                    className="w-full pl-10 pr-4 py-3 border rounded-xl bg-white focus:ring-2 focus:ring-honor-blue focus:border-honor-blue outline-none appearance-none transition-all cursor-pointer text-honor-darkGray"
                    value={selectedDistrict || ''}
                    onChange={(e) => onSelectDistrict(e.target.value)}
                    disabled={loading || !!error}>
                    {error ? (
                        <option>Ошибка загрузки округов</option>
                    ) : loading ? (
                        <option>Загрузка округов...</option>
                    ) : (
                        <>
                            <option
                                value=""
                                disabled>
                                Выберите округ...
                            </option>

                            {districts.map((district) => (
                                <option
                                    key={district.id}
                                    value={district.id}>
                                    {district.name}
                                </option>
                            ))}
                        </>
                    )}
                </select>

                {/* Кастомная стрелочка (опционально) */}
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                        />
                    </svg>
                </div>
            </div>
        </div>
    );
};

export default DistrictsList;
