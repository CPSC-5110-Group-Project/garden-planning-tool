import Konva from 'konva';
import { Rect, Group } from 'react-konva';

interface PlotProps {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    gardenWidth: number;
    gardenHeight: number;
    isSelected: boolean;
    onSelect: () => void;
    onAttach: (id: string, node: Konva.Node | null) => void;
    onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => void;
    onTransformEnd: (e: Konva.KonvaEventObject<Event>) => void;
    children?: React.ReactNode;
}

export default function Plot({
    id,
    x,
    y,
    width,
    height,
    isSelected,
    onSelect,
    onAttach,
    onDragEnd,
    onTransformEnd,
    children,
}: PlotProps) {
    return (
        <Group
            ref={(node) => onAttach(id, node)}
            x={x}
            y={y}
            draggable
            onClick={onSelect}
            onTap={onSelect}
            onDragEnd={onDragEnd}
            onTransformEnd={onTransformEnd}
        >
            <Rect
                width={width}
                height={height}
                cornerRadius={10}
                fill="rgba(255, 255, 255, 0.02)"
                stroke={isSelected ? '#00ff88' : 'white'}
                strokeWidth={isSelected ? 2 : 1}
            />
            {children}
        </Group>
    );
}
