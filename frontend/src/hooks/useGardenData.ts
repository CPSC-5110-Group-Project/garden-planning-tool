import { useState } from 'react';
import type { Garden, Plot } from '../types/garden';

export function useGardenData() {
    const [gardens, setGardens] = useState<Garden[]>([
        {
            id: 'garden1',
            name: 'Garden Area',
            x: 50,
            y: 100,
            dimensions: { width: 700, height: 500 },
            plots: [],
        },
    ]);

    const [plots, setPlots] = useState<Plot[]>([
        { id: 'plot1', x: 80, y: 150, width: 70, height: 70, plants: [1] },
        {
            id: 'plot2',
            x: 170,
            y: 150,
            width: 250,
            height: 70,
            plants: [1, 2, 3],
        },
        { id: 'plot3', x: 550, y: 280, width: 80, height: 200, plants: [1, 2] },
    ]);

    const addGarden = (name: string, x: number, y: number) => {
        const newGarden: Garden = {
            id: `garden-${Date.now()}`,
            name: name,
            x,
            y,
            dimensions: { width: 700, height: 500 },
            plots: [],
        };
        setGardens((prev) => [...prev, newGarden]);
    };

    const addPlot = () => {
        const id = `plot-${Date.now()}`;
        setPlots((prev) => [
            ...prev,
            { id, x: 50, y: 50, width: 100, height: 100, plants: [] },
        ]);
    };

    const handleMove = (id: string, x: number, y: number) => {
        setPlots((prev) => prev.map((p) => (p.id === id ? { ...p, x, y } : p)));
    };

    const handleResize = (id: string, width: number, height: number) => {
        setPlots((prev) =>
            prev.map((p) => (p.id === id ? { ...p, width, height } : p))
        );
    };

    return { gardens, plots, addGarden, addPlot, handleMove, handleResize };
}
