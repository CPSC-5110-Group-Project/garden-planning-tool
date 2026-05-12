import { useState } from 'react';
import { Group, Rect, Text } from 'react-konva';
import { PIXELS_PER_FOOT } from '../lib/utils.ts';
import Konva from 'konva';

interface GardenProps {
    id: string;
    name: string;
    x: number;
    y: number;
    rows: number;
    cols: number;
    handleMove: (id: string, x: number, y: number) => void;
    handleResize: (id: string, width: number, height: number) => void;
    children?: React.ReactNode;
}

export default function Garden({ id, name, x, y, rows, cols, handleMove, handleResize, children }: GardenProps) {
    const [isHovered, setIsHovered] = useState(false);
    const width = cols * PIXELS_PER_FOOT;
    const height = rows * PIXELS_PER_FOOT;

    const onSideDrag = (side: 'top' | 'bottom' | 'left' | 'right', e: Konva.KonvaEventObject<DragEvent>) => {
        e.cancelBubble = true;
        const node = e.target;
        const distance = side === 'top' || side === 'bottom' ? node.y() : node.x();

        let offset = 0;
        if (side === 'top' || side === 'left') offset = -5;
        if (side === 'bottom') offset = height - 5;
        if (side === 'right') offset = width - 5;

        const actualDelta = distance - offset;

        if (Math.abs(actualDelta) >= PIXELS_PER_FOOT) {
            const diff = Math.round(actualDelta / PIXELS_PER_FOOT);
            if (side === 'top') {
                handleResize(id, width, (rows - diff) * PIXELS_PER_FOOT);
                handleMove(id, x, y + diff * PIXELS_PER_FOOT);
            } else if (side === 'bottom') {
                handleResize(id, width, (rows + diff) * PIXELS_PER_FOOT);
            } else if (side === 'left') {
                handleResize(id, (cols - diff) * PIXELS_PER_FOOT, height);
                handleMove(id, x + diff * PIXELS_PER_FOOT, y);
            } else if (side === 'right') {
                handleResize(id, (cols + diff) * PIXELS_PER_FOOT, height);
            }
            if (side === 'top' || side === 'left') {
                node.position({
                    x: side === 'left' ? -5 : 0,
                    y: side === 'top' ? -5 : 0,
                });
            }
        }
    };

    return (
        <Group
            x={x}
            y={y}
            draggable={isHovered}
            onMouseEnter={() => {
                setIsHovered(true);
                document.body.style.cursor = 'move';
            }}
            onMouseLeave={() => {
                setIsHovered(false);
                document.body.style.cursor = 'default';
            }}
            onDragEnd={(e) => {
                if (e.target instanceof Konva.Group) {
                    handleMove(id, e.target.x(), e.target.y());
                }
            }}
        >
            <Rect
                width={width}
                height={height}
                fill="transparent"
                stroke={isHovered ? '#16a34a' : '#94a3b8'}
                strokeWidth={isHovered ? 3 : 1}
            />

            {isHovered && (
                <>
                    <Rect
                        x={0}
                        y={-15}
                        width={width}
                        height={30}
                        draggable
                        onDragMove={(e) => onSideDrag('top', e)}
                        onDragEnd={(e) => e.target.y(-15)}
                        onMouseEnter={() => (document.body.style.cursor = 'ns-resize')}
                        onMouseLeave={() => (document.body.style.cursor = 'move')}
                    />

                    <Rect
                        x={0}
                        y={height - 15}
                        width={width}
                        height={30}
                        draggable
                        onDragMove={(e) => onSideDrag('bottom', e)}
                        onDragEnd={(e) => e.target.y(height - 15)}
                        onMouseEnter={() => (document.body.style.cursor = 'ns-resize')}
                        onMouseLeave={() => (document.body.style.cursor = 'move')}
                    />

                    <Rect
                        x={-15}
                        y={0}
                        width={30}
                        height={height}
                        draggable
                        onDragMove={(e) => onSideDrag('left', e)}
                        onDragEnd={(e) => e.target.x(-15)}
                        onMouseEnter={() => (document.body.style.cursor = 'ew-resize')}
                        onMouseLeave={() => (document.body.style.cursor = 'move')}
                    />

                    <Rect
                        x={width - 15}
                        y={0}
                        width={30}
                        height={height}
                        draggable
                        onDragMove={(e) => onSideDrag('right', e)}
                        onDragEnd={(e) => e.target.x(width - 15)}
                        onMouseEnter={() => (document.body.style.cursor = 'ew-resize')}
                        onMouseLeave={() => (document.body.style.cursor = 'move')}
                    />
                </>
            )}

            <Text text={name} y={-25} fontSize={14} fontStyle="bold" fill={isHovered ? '#16a34a' : '#334155'} />
            {children}
        </Group>
    );
}
