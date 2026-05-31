import { useState } from 'react';
import { Rect, Group, Text } from 'react-konva';
import { PIXELS_PER_FOOT } from '../lib/utils';
import { type Plant, type Plot } from '../types/garden';
import { getPlantIcon } from '../lib/utils';

interface PlotProps {
    x: number;
    y: number;
    data?: Plot;
    isDraggingOver: boolean;
    timelineDays: number;
    onPlantMouseOver: (plant: Plant, x: number, y: number) => void;
    onPlantMouseOut: () => void;
}

export default function Plot({
    x,
    y,
    data,
    isDraggingOver,
    timelineDays,
    onPlantMouseOut,
    onPlantMouseOver,
}: PlotProps) {
    const [isHovered, setIsHovered] = useState(false);

    const hasPlant = !!data?.plantId;

    const getDaysElapsed = (): number => {
        if (!data?.plantedAt) return timelineDays;

        const plantDate = new Date(data.plantedAt);
        const currentTimelineDate = new Date();
        currentTimelineDate.setDate(currentTimelineDate.getDate() + timelineDays);

        const diffTime = currentTimelineDate.getTime() - plantDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays < 0 ? 0 : diffDays;
    };

    const daysElapsed = hasPlant ? getDaysElapsed() : 0;
    const currentIcon = hasPlant ? getPlantIcon(daysElapsed, data.plant) : '🌱';

    return (
        <Group
            x={x}
            y={y}
            onMouseEnter={(e) => {
                setIsHovered(true);
                if (data && data.plant) {
                    const stage = e.target.getStage();
                    const pointer = stage?.getPointerPosition();

                    onPlantMouseOver(data.plant, pointer?.x ?? 0, pointer?.y ?? 0);
                }
            }}
            onMouseLeave={() => {
                setIsHovered(false);
                onPlantMouseOut();
            }}
        >
            <Rect
                width={PIXELS_PER_FOOT}
                height={PIXELS_PER_FOOT}
                fill={(isHovered || isDraggingOver) && !hasPlant ? 'rgba(22, 163, 74, 0.1)' : 'transparent'}
                stroke="#cbd5e1"
                strokeWidth={0.5}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            />

            {hasPlant && (
                <Text
                    text={currentIcon}
                    fontSize={24}
                    x={PIXELS_PER_FOOT / 2 - 12}
                    y={PIXELS_PER_FOOT / 2 - 12}
                    opacity={1}
                />
            )}
        </Group>
    );
}
