import { useState } from 'react';
import { Group, Rect, Text } from 'react-konva';
import { type Garden } from '../types/garden.ts';

interface GardenProps {
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
    scale: number;
    selectedId: string | null;
    children?: React.ReactNode;
}

export default function Garden({
    name,
    x,
    y,
    width,
    height,
    scale,
    children,
}: GardenProps) {
    const [isHovered, setIsHovered] = useState(false);
    const activeColor = '#4CAF50';
    const idleColor = '#333';

    return (
        <Group
            x={x}
            y={y}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            draggable
        >
            <Rect
                x={0}
                y={0}
                width={width}
                height={height}
                stroke={isHovered ? activeColor : idleColor}
                strokeWidth={(isHovered ? 2 : 1) / scale}
                dash={[5 / scale, 5 / scale]}
            />

            <Text
                x={0}
                y={-20 / scale}
                text={name}
                fontSize={14 / scale}
                fill={isHovered ? activeColor : '#888'}
                fontStyle="bold"
            />
            {children}
        </Group>
    );
}
