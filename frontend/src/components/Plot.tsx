import { useState } from 'react';
import { Rect, Group, Text } from 'react-konva';
import { PIXELS_PER_FOOT } from '../lib/utils';
import { type Plant, type Plot } from '../types/garden';

interface PlotProps {
    x: number;
    y: number;
    data?: Plot;
    isDraggingOver: boolean;
    onPlantMouseOver: (plant: Plant, x: number, y: number) => void;
    onPlantMouseOut: () => void;
}

export default function Plot({ x, y, data, isDraggingOver, onPlantMouseOut, onPlantMouseOver }: PlotProps) {
    const [isHovered, setIsHovered] = useState(false);

    const hasPlant = !!data?.plantId;

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
                <Text text="🌱" fontSize={20} x={PIXELS_PER_FOOT / 2 - 10} y={PIXELS_PER_FOOT / 2 - 10} opacity={1} />
            )}
        </Group>
    );
}
