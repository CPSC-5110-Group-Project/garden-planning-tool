export interface Plant {
    perenual_id: number;
    common_name: string;
    scientific_name?: string | null;
    watering?: string | null;
    sunlight?: string | null;
    care_level?: string | null;
    image_url?: string | null;
    growth_rate?: string | null;
    type?: string | null;
    edible_fruit?: boolean | null;
    edible_leaf?: boolean | null;
    flowers?: boolean | null;
}

export interface Plot {
    sunExposure: string;
    isPlantable: boolean;
    plantId?: number;
    plant?: Plant;
    plantedAt?: string | null;
}

export interface Garden {
    id: string;
    name: string;
    x: number;
    y: number;
    rows: number;
    cols: number;
    plots: Record<string, Plot>;
}
