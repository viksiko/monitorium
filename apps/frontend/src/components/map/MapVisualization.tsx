import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { MapPin, Plus, AlertTriangle, BarChart, TrendingUp } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { useToggleShowShortStats } from '@/shared/stores/toggleShowShortStats.store';
import { useAuth } from '@/context/AuthContext';
import { TaskCreateButton } from '../ui/taskCreateButton';

interface DistrictsShortStats {
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
    selectedDistrict: string | null;
    showProblems: boolean;
    onToggleProblems: () => void;
    onSelectDistrict: (name: string) => void;
}

const MapVisualization = ({
    selectedDistrict,
    showProblems,
    onToggleProblems,
    onSelectDistrict,
}: MapVisualizationProps) => {
    // const selectedDistrictData = districts.find((d) => d.id === selectedDistrict);
    const { user } = useAuth();

    const [districtsShortStats, setDistrictsShortStats] = useState([]);
    const { request } = useApi<DistrictsShortStats[]>();

    const mapRef = useRef<HTMLDivElement | null>(null);
    const mapInstance = useRef<any>(null);
    const objectManagerRef = useRef<any>(null);

    const { isShortStatsVisible, toggleShowShortStats } = useToggleShowShortStats();

    // Загружает скрипт Яндекс.Карт
    const loadYandexMapsScript = () => {
        return new Promise((resolve) => {
            // Если API уже загружен — сразу возвращаем
            if (window.ymaps) {
                resolve(window.ymaps);
                return;
            }

            // Создаём script тег с API
            const script = document.createElement('script');
            script.src = `https://api-maps.yandex.ru/2.1/?apikey=${import.meta.env.VITE_API_MAP_YANDEX_KEY}&lang=ru_RU`;
            script.async = true;

            // Ждём загрузки API
            script.onload = () => resolve(window.ymaps);

            document.body.appendChild(script);
        });
    };

    // const onToggleStats2 = () => {
    //     const newValue = !showStats;
    //     setShowStats2(newValue);

    //     if (!objectManagerRef.current) return;

    //     objectManagerRef.current.objects.each((obj: any) => {
    //         objectManagerRef.current.objects.setObjectProperties(obj.id, {
    //             ...obj.properties,
    //             showStatsGlobal: newValue,
    //         });
    //     });
    // };

    useEffect(() => {
        request({ method: 'GET', url: '/api/v1/districts/short-stats' }).then(setDistrictsShortStats);
    }, []);

    useEffect(() => {
        let map: any;

        // Загружаем API и инициализируем карту
        loadYandexMapsScript().then((ymaps: any) => {
            ymaps.ready(() => {
                // Шаблон блока с информацией о задачах рядом с каждым point
                const statsTasks = ymaps.templateLayoutFactory.createClass(`
                    <div style="display: flex; align-items: center;">
                      {% if properties.showStatsGlobal %}
                        <div style="background: white; padding: 4px 6px; border-radius:5px; font-size: 12px;">
                          <div style="display: flex;">
                            <div style="margin-right: 2px;">Выполнено:</div>
                            <div style="display: flex;"><span>{{ properties.tasksCompleted }}</span> / <span>{{ properties.tasksTotal }}</span></div> 
                          </div>
                            <div style="width:100%; height:6px; background-color:#E5E7EB; border-radius:50px; overflow:hidden;">
                              <div style="background-color: #0052CC; height: 100%; width: {{ properties.percent }}%; border-radius: 50px; transition: width 0.3s ease;"></div>
                            </div>
                        </div>
                        
                      {% endif %}
                    </div>
                  `);

                if (!mapRef.current) return; // контейнер ещё не готов

                // Создание карты
                map = new ymaps.Map(mapRef.current, {
                    center: [52.5, 82.5], // центр (Барнаул)
                    zoom: 7,
                    controls: ['zoomControl'], // только нужные контролы
                });

                map.options.set('maxZoom', 12);
                map.options.set('minZoom', 6);

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

                        const preparedFeatures = converted.features.flatMap((feature: any) => {
                            const props = feature.properties || {};
                            const id = feature.id;
                            const stats = serverDataMap[id];
                            const percent =
                                stats?.tasksTotal > 0 ? Math.round((stats.tasksCompleted / stats.tasksTotal) * 100) : 0;

                            const customProps = {
                                ...props,
                                tasksTotal: stats?.tasksTotal ?? 0,
                                tasksCompleted: stats?.tasksCompleted ?? 0,
                                percent: percent,
                            };

                            if (feature.geometry.type === 'Point') {
                                // оригинальный preset
                                const baseFeature = {
                                    ...feature,
                                    id,
                                    properties: customProps,
                                    options: {
                                        // iconLayout: 'islands#dotIcon',
                                        preset: 'islands#dotIcon',
                                        iconColor: props['marker-color'] || '#ed4543',
                                    },
                                };

                                // кастомный блок
                                const customFeature = {
                                    ...feature,
                                    id: `custom-${id}`,
                                    geometry: {
                                        type: 'Point',
                                        coordinates: [feature.geometry.coordinates[0], feature.geometry.coordinates[1]],
                                    },
                                    properties: {
                                        ...customProps,
                                        showStatsGlobal: isShortStatsVisible,
                                    },
                                    options: { iconLayout: statsTasks },
                                };

                                return [baseFeature, customFeature];
                            }

                            if (feature.geometry.type === 'Polygon') {
                                return [
                                    {
                                        ...feature,
                                        properties: customProps,
                                        options: {
                                            fillColor: props.fill || '#1e98ff', // берём именно текущий feature
                                            fillOpacity: props['fill-opacity'] || 0.4,
                                            strokeColor: props.stroke || '#b3b3b3',
                                            strokeWidth: Number(props['stroke-width']) || 2,
                                            strokeOpacity: props['stroke-opacity'] || 0.9,
                                        },
                                    },
                                ];
                            }

                            return [feature];
                        });

                        // ⚠️ Добавляем данные ОДИН раз
                        objectManager.add({ ...converted, features: preparedFeatures });
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
                                const parts = districtName.trim().split(/\s+/);
                                const valueForSelect = parts.length > 1 ? parts.slice(-2).join(' ') : parts[0];
                                onSelectDistrict(valueForSelect);
                            }

                            // 👉 логика зума для Point
                            if (object.geometry.type === 'Point') {
                                const coords = object.geometry.coordinates;

                                mapInstance.current.setCenter(coords, 11, {
                                    duration: 300,
                                });
                            }

                            // 👉 логика зума для Polygon
                            // if (object.geometry.type === 'Polygon') {
                            //     const coords = object.geometry.coordinates[0];

                            //     let latSum = 0;
                            //     let lngSum = 0;

                            //     coords.forEach(([lat, lng]) => {
                            //         latSum += lat;
                            //         lngSum += lng;
                            //     });

                            //     const center = [latSum / coords.length, lngSum / coords.length];

                            //     mapInstance.current.setCenter(center, 11, {
                            //         duration: 300,
                            //     });
                            // }
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
    }, [isShortStatsVisible]);

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

    // Использовалось для того что бы блок с выполненыыми задачами на карте появлялся без перередеринга карты. Возможно к этом надо будет снова прийти
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

    const serverDataMap = Object.fromEntries(
        districtsShortStats.map((item) => [
            item.mapId,
            {
                tasksTotal: item.tasksTotal,
                tasksCompleted: item.tasksCompleted,
            },
        ]),
    );

    // 🔁 Рекурсивно переворачивает координаты [lng, lat] → [lat, lng]
    const flipCoords = (coords: any): any => {
        if (typeof coords[0] === 'number') {
            return [coords[1], coords[0]];
        }
        return coords.map(flipCoords);
    };

    // 🔄 Конвертирует весь GeoJSON под формат Яндекс.Карт
    const convertGeoJSON = (data: any) => {
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
    };

    return (
        <div className="honor-card relative min-h-[500px] flex items-center justify-center">
            <div
                ref={mapRef}
                className="absolute inset-0 w-full h-full"
            />

            {/* Управление картой */}
            <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                <TaskCreateButton />

                {/* <Button
                    variant="outline"
                    className="bg-white w-full justify-start"
                    onClick={onToggleProblems}>
                    <AlertTriangle
                        size={18}
                        className="mr-2"
                    />
                    {showProblems ? 'Скрыть проблемы' : 'Показать проблемы'}
                </Button> */}
                <Button
                    variant="outline"
                    className="bg-white w-full justify-start"
                    onClick={toggleShowShortStats}>
                    <BarChart
                        size={18}
                        className="mr-2"
                    />
                    {isShortStatsVisible ? 'Скрыть статистику' : 'Показать статистику'}
                </Button>
            </div>

            {/* Статистика по округам на карте */}
            {/* {showStats &&
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
                ))} */}
        </div>
    );
};

export default MapVisualization;
