import { useState } from 'react';
import { Rect, Group, Text } from 'react-konva';
import { PIXELS_PER_FOOT } from '../lib/utils';
import { type Plant, type Plot as PlotType } from '../types/garden';
import { getPlantIcon } from '../lib/utils';

const THEME = {
    plotBg: '#eef0e5',
    soilBg: '#ebcca0',
    plotBorder: '#5a6534',
    hoverEmptyBg: 'rgba(105, 141, 63, 0.15)',
};

interface PlotProps {
    x: number;
    y: number;
    data?: PlotType & { isTreeChild?: boolean; anchorKey?: string };
    isDraggingOver: boolean;
    timelineDays: number;
    onPlantMouseOver: (plant: Plant, x: number, y: number) => void;
    onPlantMouseOut: () => void;
    renderLayer: 'background' | 'foreground'; // Explicit layering switch
}

export default function Plot({
    x,
    y,
    data,
    isDraggingOver,
    timelineDays,
    onPlantMouseOut,
    onPlantMouseOver,
    renderLayer,
}: PlotProps) {
    const [isHovered, setIsHovered] = useState(false);

    const hasPlant = !!data?.plantId;
    const isChild = !!data?.isTreeChild;
    const isTree = data?.plant?.type?.toLowerCase() === 'tree';

    const getDaysElapsed = (): number => {
        if (!data?.plantedAt) return timelineDays;
        const plantDate = new Date(data.plantedAt);
        const currentTimelineDate = new Date();
        currentTimelineDate.setDate(currentTimelineDate.getDate() + timelineDays);
        const diffTime = currentTimelineDate.getTime() - plantDate.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) < 0 ? 0 : Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const daysElapsed = hasPlant ? getDaysElapsed() : 0;
    const currentIcon = hasPlant ? getPlantIcon(daysElapsed, data.plant) : '🌱';

    if (renderLayer === 'background') {
        return (
            <Group
                x={x}
                y={y}
                listening={!isChild}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => {
                    setIsHovered(false);
                    onPlantMouseOut();
                }}
            >
                <Rect
                    width={PIXELS_PER_FOOT}
                    height={PIXELS_PER_FOOT}
                    fill={
                        hasPlant || isChild
                            ? THEME.soilBg
                            : isHovered || isDraggingOver
                              ? THEME.hoverEmptyBg
                              : THEME.plotBg
                    }
                />
                {isTree ? (
                    <>
                        {!isChild && (
                            <Rect
                                width={PIXELS_PER_FOOT * 2}
                                height={PIXELS_PER_FOOT * 2}
                                stroke={THEME.plotBorder}
                                strokeWidth={1}
                                listening={false}
                            />
                        )}
                    </>
                ) : (
                    !isChild && (
                        <Rect
                            width={PIXELS_PER_FOOT}
                            height={PIXELS_PER_FOOT}
                            stroke={THEME.plotBorder}
                            strokeWidth={0.5}
                        />
                    )
                )}
            </Group>
        );
    }

    // Foreground layer logic execution
    return (
        <Group x={x} y={y} listening={false}>
            {hasPlant && !isChild && (
                <Text
                    text={currentIcon}
                    fontSize={isTree ? 110 : 70}
                    width={isTree ? PIXELS_PER_FOOT * 2 : PIXELS_PER_FOOT}
                    height={isTree ? PIXELS_PER_FOOT * 2 : PIXELS_PER_FOOT}
                    align="center"
                    verticalAlign="middle"
                    opacity={1}
                    onMouseEnter={(e) => {
                        if (data?.plant) {
                            const stage = e.target.getStage();
                            const pointer = stage?.getPointerPosition();
                            onPlantMouseOver(data.plant, pointer?.x ?? 0, pointer?.y ?? 0);
                        }
                    }}
                />
            )}
        </Group>
    );
}
