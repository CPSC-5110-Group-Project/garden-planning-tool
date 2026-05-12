export interface Plant {
    perenual_id: number;
    common_name: string;
    scientific_name?: string | null;
    watering?: string | null;
    sunlight?: string | null;
    care_level?: string | null;
    image_url?: string | null;
}

export interface Plot {
    sunExposure: string;
    isPlantable: boolean;
    plantId?: number;
    plant?: Plant;
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
