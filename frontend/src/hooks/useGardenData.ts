import { useState, useCallback } from 'react';
import type { Garden, Plant } from '../types/garden';
import { PIXELS_PER_FOOT } from '../lib/utils';

export function useGardenData() {
    const [gardens, setGardens] = useState<Record<string, Garden>>({});

    const addGarden = useCallback((name: string, x: number, y: number) => {
        const id = `garden-${Date.now()}`;
        setGardens((prev) => ({
            ...prev,
            [id]: {
                id,
                name,
                x,
                y,
                rows: 5,
                cols: 5,
                plots: {},
            },
        }));
    }, []);

    const handleMove = useCallback((id: string, x: number, y: number) => {
        setGardens((prev) => {
            if (!prev[id]) return prev;
            return {
                ...prev,
                [id]: { ...prev[id], x, y },
            };
        });
    }, []);

    const handleResize = useCallback((id: string, newWidth: number, newHeight: number) => {
        setGardens((prev) => {
            const garden = prev[id];
            if (!garden) return prev;

            return {
                ...prev,
                [id]: {
                    ...garden,
                    cols: Math.max(1, Math.round(newWidth / PIXELS_PER_FOOT)),
                    rows: Math.max(1, Math.round(newHeight / PIXELS_PER_FOOT)),
                },
            };
        });
    }, []);

    const addPlant = useCallback((gardenId: string, plotKey: string, plant: Plant) => {
        setGardens((prev) => {
            const garden = prev[gardenId];
            if (!garden) return prev;

            return {
                ...prev,
                [gardenId]: {
                    ...garden,
                    plots: {
                        ...garden.plots,
                        [plotKey]: {
                            ...(garden.plots[plotKey] || { sunExposure: 'full', isPlantable: true }),
                            plantId: plant.perenual_id,
                            plant: plant,
                        },
                    },
                },
            };
        });
    }, []);

    return {
        gardens,
        addGarden,
        handleMove,
        handleResize,
        addPlant,
    };
}
