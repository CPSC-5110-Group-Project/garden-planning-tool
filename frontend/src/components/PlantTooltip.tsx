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
            className={`absolute z-50 pointer-events-none bg-bg-main border border-border-main rounded-xl shadow-xl w-64 transition-all duration-300 ease-out p-1 ${
                shouldShow ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-1'
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
