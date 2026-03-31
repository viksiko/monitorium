export interface District {
    id: string;
    mapId: number;
    areas?: Area[];
}

export interface Area {
    id: string;
    name: string;
}
