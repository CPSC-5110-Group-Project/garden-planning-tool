import { useState, useEffect } from 'react';
import PlantCard from './PlantCard';
import { type Plant } from '../types/garden';

interface TooltipProps {
    data: { plant: Plant; x: number; y: number } | null;
    delay?: number;
}

export default function PlantTooltip({ data, delay = 400 }: TooltipProps) {
    const [shouldShow, setShouldShow] = useState(false);
    const [activeData, setActiveData] = useState<{ plant: Plant; x: number; y: number } | null>(null);

    // Sync data during render to avoid the "activeData" sync warning
    if (data && data !== activeData) {
        setActiveData(data);
    }

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        let cleanupTimer: ReturnType<typeof setTimeout>;

        if (data) {
            timer = setTimeout(() => setShouldShow(true), delay);
        } else {
            timer = setTimeout(() => setShouldShow(false), 0);

            cleanupTimer = setTimeout(() => setActiveData(null), 300);
        }

        return () => {
            clearTimeout(timer);
            clearTimeout(cleanupTimer);
        };
    }, [data, delay]);

    if (!activeData && !shouldShow) return null;

    return (
        <div
            className={`absolute z-50 pointer-events-none bg-gray-900 border border-gray-600 rounded-lg shadow-xl w-64 transition-all duration-300 ease-in-out ${
                shouldShow ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
            style={{
                left: (activeData?.x ?? 0) + 15,
                top: (activeData?.y ?? 0) + 15,
            }}
        >
            {activeData && <PlantCard plant={activeData.plant} />}
        </div>
    );
}
