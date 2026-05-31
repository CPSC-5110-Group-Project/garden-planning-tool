import { type Plant } from '../types/garden';

export const PIXELS_PER_FOOT = 100;

export function getResizedImageUrl(url: string, width: number, height: number): string {
    if (!url) return url;
    return (
        url.replace('/storage/v1/object/', '/storage/v1/render/image/') +
        `?width=${width}&height=${height}&resize=cover`
    );
}

export const getPlantIcon = (daysElapsed: number, plant?: Plant): string => {
    const rate = plant?.growth_rate?.toLowerCase() || 'medium';
    const type = plant?.type?.toLowerCase() || '';

    const maturityDaysMap: Record<string, number> = {
        high: 45,
        medium: 90,
        low: 180,
    };

    const daysToMaturity = maturityDaysMap[rate] || 90;

    if (daysElapsed <= 0) return '🌱';

    const progress = daysElapsed / daysToMaturity;

    if (type.includes('tree') || type.includes('shrub')) {
        if (progress < 0.25) return '🌱';
        if (progress < 0.65) return '🌿';
        return '🌳';
    }

    if (plant?.edible_fruit || plant?.edible_leaf) {
        if (progress < 0.25) return '🌱';
        if (progress < 0.6) return '🌿';
        return '🥕';
    }

    if (progress < 0.25) return '🌱';
    if (progress < 0.6) return '🌿';
    return '🌻';
};
