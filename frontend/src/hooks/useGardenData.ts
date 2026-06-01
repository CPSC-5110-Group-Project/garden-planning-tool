import { useState, useCallback, useEffect, useRef } from 'react';
import type { Garden, Plant } from '../types/garden';
import { PIXELS_PER_FOOT } from '../lib/utils';
import { loadGardensFromDB, saveGardensToDB } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

export function useGardenData() {
    const { isGuest } = useAuth();
    const [gardens, setGardens] = useState<Record<string, Garden>>({});
    const [loaded, setLoaded] = useState(false);
    const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Load gardens from DB on login
    useEffect(() => {
        if (isGuest) { setLoaded(true); return; }
        loadGardensFromDB()
            .then(data => {
                const map: Record<string, Garden> = {};
                for (const g of data) map[g.id] = g;
                setGardens(map);
            })
            .catch(() => {})
            .finally(() => setLoaded(true));
    }, [isGuest]);

    // Auto-save to DB 1.5s after any change
    const scheduleSave = useCallback((updated: Record<string, Garden>) => {
        if (isGuest) return;
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => {
            saveGardensToDB(updated).catch(() => {});
        }, 1500);
    }, [isGuest]);

    const addGarden = useCallback((name: string, x: number, y: number) => {
        const id = `garden-${Date.now()}`;
        setGardens(prev => {
            const updated = { ...prev, [id]: { id, name, x, y, rows: 5, cols: 5, plots: {} } };
            scheduleSave(updated);
            return updated;
        });
    }, [scheduleSave]);

    const handleMove = useCallback((id: string, x: number, y: number) => {
        setGardens(prev => {
            if (!prev[id]) return prev;
            const updated = { ...prev, [id]: { ...prev[id], x, y } };
            scheduleSave(updated);
            return updated;
        });
    }, [scheduleSave]);

    const handleResize = useCallback((id: string, newWidth: number, newHeight: number) => {
        setGardens(prev => {
            const garden = prev[id];
            if (!garden) return prev;
            const updated = {
                ...prev,
                [id]: {
                    ...garden,
                    cols: Math.max(1, Math.round(newWidth / PIXELS_PER_FOOT)),
                    rows: Math.max(1, Math.round(newHeight / PIXELS_PER_FOOT)),
                },
            };
            scheduleSave(updated);
            return updated;
        });
    }, [scheduleSave]);

    const addPlant = useCallback((gardenId: string, plotKey: string, plant: Plant) => {
        setGardens(prev => {
            const garden = prev[gardenId];
            if (!garden) return prev;
            const updated = {
                ...prev,
                [gardenId]: {
                    ...garden,
                    plots: {
                        ...garden.plots,
                        [plotKey]: {
                            ...(garden.plots[plotKey] || { sunExposure: 'full', isPlantable: true }),
                            plantId: plant.perenual_id,
                            plant,
                        },
                    },
                },
            };
            scheduleSave(updated);
            return updated;
        });
    }, [scheduleSave]);

    return { gardens, addGarden, handleMove, handleResize, addPlant, loaded };
}
