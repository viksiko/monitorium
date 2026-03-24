import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { MapPin, Plus, AlertTriangle, BarChart, TrendingUp } from 'lucide-react';

interface District {
    id: number;
    name: string;
    description: string;
    stats: {
        tasksCompleted: number;
        tasksTotal: number;
    };
    problems: Array<{
        id: number;
        title: string;
        status: string;
        priority: string;
    }>;
}

interface MapVisualizationProps {
    districts: District[];
    selectedDistrict: string | null;
    showProblems: boolean;
    showStats: boolean;
    onToggleProblems: () => void;
    onToggleStats: () => void;
    onSelectDistrict: (name: string) => void;
}

const MapVisualization = ({
    districts,
    selectedDistrict,
    showProblems,
    showStats,
    onToggleProblems,
    onToggleStats,
    onSelectDistrict,
}: MapVisualizationProps) => {
    // const selectedDistrictData = districts.find((d) => d.id === selectedDistrict);

    const mapRef = useRef<HTMLDivElement | null>(null);
    const mapInstance = useRef<any>(null);
    const objectManagerRef = useRef<any>(null);

    // Загружает скрипт Яндекс.Карт только при необходимости
    const loadYandexMapsScript = () => {
        return new Promise((resolve) => {
            // Если API уже загружен — сразу возвращаем
            if (window.ymaps) {
                resolve(window.ymaps);
                return;
            }

            // Создаём script тег с API
            const script = document.createElement('script');
            script.src = 'https://api-maps.yandex.ru/2.1/?apikey=2f6480a4-3d69-4cc8-8d9d-e941e9d56385&lang=ru_RU';
            script.async = true;

            // Ждём загрузки API
            script.onload = () => resolve(window.ymaps);

            document.body.appendChild(script);
        });
    };

    useEffect(() => {
        let map: any;

        // Загружаем API и инициализируем карту
        loadYandexMapsScript().then((ymaps: any) => {
            ymaps.ready(() => {
                if (!mapRef.current) return; // контейнер ещё не готов

                // Создание карты
                map = new ymaps.Map(mapRef.current, {
                    center: [52.5, 82.5], // центр (Барнаул)
                    zoom: 7,
                    controls: ['zoomControl'], // только нужные контролы
                });

                // Загружаем GeoJSON
                fetch('/map.geojson')
                    .then((res) => res.json())
                    .then((data) => {
                        // ⚠️ Конвертируем координаты под Яндекс (lat, lng)
                        const converted = convertGeoJSON(data);

                        // Менеджер объектов (полигоны, точки)
                        const objectManager = new ymaps.ObjectManager({
                            clusterize: false, // отключаем кластеризацию
                        });

                        // ⚠️ Подготавливаем данные со стилями ДО add()
                        const prepared = {
                            ...converted,
                            features: converted.features.map((feature: any) => {
                                const props = feature.properties || {};

                                // Стили для полигонов
                                if (feature.geometry.type === 'Polygon') {
                                    return {
                                        ...feature,
                                        options: {
                                            fillColor: props.fill || '#1e98ff',
                                            fillOpacity: props['fill-opacity'] || 0.4,
                                            strokeColor: props.stroke || '#b3b3b3',
                                            strokeWidth: Number(props['stroke-width']) || 2,
                                            strokeOpacity: props['stroke-opacity'] || 0.9,
                                        },
                                    };
                                }

                                // Стили для точек (маркеров)
                                if (feature.geometry.type === 'Point') {
                                    return {
                                        ...feature,
                                        options: {
                                            preset: 'islands#dotIcon',
                                            iconColor: props['marker-color'] || '#ed4543',
                                        },
                                    };
                                }

                                return feature; // остальные типы без изменений
                            }),
                        };

                        // ⚠️ Добавляем данные ОДИН раз
                        objectManager.add(prepared);

                        // Добавляем на карту
                        map.geoObjects.add(objectManager);

                        mapInstance.current = map;
                        objectManagerRef.current = objectManager;

                        objectManager.objects.events.add('click', (e: any) => {
                            const objectId = e.get('objectId');
                            const object = objectManager.objects.getById(objectId);

                            if (!object) return;

                            const districtName = object.properties.description;

                            // 👉 выбираем округ (это обновит select)
                            if (districtName) {
                                onSelectDistrict(districtName);
                            }

                            // 👉 логика зума для Point
                            if (object.geometry.type === 'Point') {
                                const coords = object.geometry.coordinates;

                                mapInstance.current.setCenter(coords, 11, {
                                    duration: 300,
                                });
                            }

                            // 👉 логика зума для Polygon
                            if (object.geometry.type === 'Polygon') {
                                const coords = object.geometry.coordinates[0];

                                let latSum = 0;
                                let lngSum = 0;

                                coords.forEach(([lat, lng]) => {
                                    latSum += lat;
                                    lngSum += lng;
                                });

                                const center = [latSum / coords.length, lngSum / coords.length];

                                mapInstance.current.setCenter(center, 11, {
                                    duration: 300,
                                });
                            }
                        });

                        objectManager.objects.events.add('mouseenter', (e: any) => {
                            const objectId = e.get('objectId');

                            objectManager.objects.setObjectOptions(objectId, {
                                strokeColor: '#ff0000', // цвет границы при наведении
                                strokeWidth: 2, // можно чуть увеличить толщину
                            });
                        });

                        objectManager.objects.events.add('mouseleave', (e: any) => {
                            const objectId = e.get('objectId');

                            // возвращаем стандартные стили
                            const object = objectManager.objects.getById(objectId);
                            const props = object.properties || {};

                            objectManager.objects.setObjectOptions(objectId, {
                                strokeColor: props.stroke || '#b3b3b3',
                                strokeWidth: Number(props['stroke-width']) || 2,
                            });
                        });

                        // ⚠️ Подгоняем карту под все объекты
                        // const bounds = objectManager.getBounds();
                        // if (bounds) {
                        //     map.setBounds(bounds, { checkZoomRange: true });
                        // }
                    });
            });
        });

        // Очистка карты при размонтировании (важно для SPA)
        return () => {
            if (map) {
                map.destroy();
            }
        };
    }, []);

    useEffect(() => {
        if (!selectedDistrict || !objectManagerRef.current || !mapInstance.current) return;

        const objectManager = objectManagerRef.current;
        const map = mapInstance.current;

        // Находим объект с districtId
        let targetObject: any = null;
        objectManager.objects.each((obj: any) => {
            if (obj.properties.description === selectedDistrict) {
                targetObject = obj;
            }
        });

        if (!targetObject) return;

        // Для Point
        if (targetObject.geometry.type === 'Point') {
            const coords = targetObject.geometry.coordinates;
            map.setCenter(coords, 11, { duration: 300 });
        }
    }, [selectedDistrict]);

    // useEffect(() => {
    //     console.log('t', !objectManagerRef.current, !selectedDistrict);
    //     if (!objectManagerRef.current || !selectedDistrict) return;

    //     objectManagerRef.current.objects.each((obj: any) => {
    //         if (obj.properties.districtId === selectedDistrict) {
    //             objectManagerRef.current.objects.setObjectOptions(obj.id, {
    //                 iconColor: '#000000',
    //             });
    //         }
    //     });
    // }, [selectedDistrict]);

    // 🔁 Рекурсивно переворачивает координаты [lng, lat] → [lat, lng]
    function flipCoords(coords: any): any {
        if (typeof coords[0] === 'number') {
            return [coords[1], coords[0]];
        }
        return coords.map(flipCoords);
    }

    // 🔄 Конвертирует весь GeoJSON под формат Яндекс.Карт
    function convertGeoJSON(data: any) {
        return {
            ...data,
            features: data.features.map((feature: any) => ({
                ...feature,
                geometry: {
                    ...feature.geometry,
                    coordinates: flipCoords(feature.geometry.coordinates),
                },
            })),
        };
    }

    return (
        <div className="honor-card relative min-h-[500px] flex items-center justify-center">
            <div
                ref={mapRef}
                className="absolute inset-0 w-full h-full"
            />

            {/* Управление картой */}
            <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                <Link to="/tasks/create">
                    <Button className="honor-button-primary flex items-center space-x-2 w-full justify-start">
                        <Plus size={18} />
                        <span>Создать задание</span>
                    </Button>
                </Link>
                <Button
                    variant="outline"
                    className="bg-white w-full justify-start"
                    onClick={onToggleProblems}>
                    <AlertTriangle
                        size={18}
                        className="mr-2"
                    />
                    {showProblems ? 'Скрыть проблемы' : 'Показать проблемы'}
                </Button>
                <Button
                    variant="outline"
                    className="bg-white w-full justify-start"
                    onClick={onToggleStats}>
                    <BarChart
                        size={18}
                        className="mr-2"
                    />
                    {showStats ? 'Скрыть статистику' : 'Показать статистику'}
                </Button>
            </div>

            {/* Статистика по округам на карте */}
            {showStats &&
                districts.map((district, index) => (
                    <div
                        key={`stat-${district.id}`}
                        className="absolute bg-white/90 p-3 rounded-lg border border-honor-blue shadow-sm"
                        style={{
                            bottom: `${20 + index * 15}%`,
                            right: `${15 + index * 8}%`,
                            maxWidth: '180px',
                            zIndex: 5,
                        }}>
                        <p className="text-sm font-semibold text-honor-blue">{district.name}</p>
                        <div className="flex items-center gap-1 text-xs text-honor-darkGray mt-1">
                            <TrendingUp size={14} />
                            <span>
                                Выполнено: {district.stats.tasksCompleted}/{district.stats.tasksTotal}
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                            <div
                                className="bg-honor-blue h-1.5 rounded-full"
                                style={{
                                    width: `${(district.stats.tasksCompleted / district.stats.tasksTotal) * 100}%`,
                                }}></div>
                        </div>
                    </div>
                ))}
        </div>
    );
};

export default MapVisualization;
