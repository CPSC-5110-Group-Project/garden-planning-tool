export interface Plant {
    perenual_id: number;
    common_name: string;
    scientific_name?: string | null;
    watering?: string | null;
    sunlight?: string | null;
    care_level?: string | null;
    image_url?: string | null;
    cycle?: string | null;
    maintenance?: string | null;
    poisonous_to_humans?: boolean | null;
    poisonous_to_pets?: boolean | null;
    edible_fruit?: boolean | null;
    edible_leaf?: boolean | null;
    medicinal?: boolean | null;
    flowers?: boolean | null;
    attracts?: string | null;
    description?: string | null;
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
