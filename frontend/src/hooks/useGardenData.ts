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

            const [rowStr, colStr] = plotKey.split('-');
            const r = parseInt(rowStr, 10);
            const c = parseInt(colStr, 10);

            const isTree = plant.type?.toLowerCase() === 'tree';
            const updatedPlots = { ...garden.plots };

            if (isTree) {
                const targetKeys = [`${r}-${c}`, `${r}-${c + 1}`, `${r + 1}-${c}`, `${r + 1}-${c + 1}`];

                if (r + 1 >= garden.rows || c + 1 >= garden.cols) {
                    console.warn('Not enough room for a tree edge here!');
                    return prev;
                }

                const isAreaClear = targetKeys.every((key) => !updatedPlots[key]?.plantId);
                if (!isAreaClear) {
                    console.warn('Space is blocked by another plant!');
                    return prev;
                }

                const plantedAt = new Date().toISOString();

                targetKeys.forEach((key, index) => {
                    updatedPlots[key] = {
                        ...(updatedPlots[key] || { sunExposure: 'full', isPlantable: true }),
                        plantId: plant.perenual_id,
                        plant: plant,
                        plantedAt,
                        isTreeChild: index !== 0,
                        anchorKey: plotKey,
                    };
                });
            } else {
                if (updatedPlots[plotKey]?.plantId) return prev;

                updatedPlots[plotKey] = {
                    ...(updatedPlots[plotKey] || { sunExposure: 'full', isPlantable: true }),
                    plantId: plant.perenual_id,
                    plant: plant,
                    plantedAt: new Date().toISOString(),
                };
            }

            return {
                ...prev,
                [gardenId]: {
                    ...garden,
                    plots: updatedPlots,
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
