import { useState, useRef, useEffect } from 'react';
import Konva from 'konva';
import { Group, Rect, Text, Transformer } from 'react-konva';
import Plot from './Plot';
import { type Plot as PlotData, type Garden } from '../types/garden.ts';

interface GardenProps {
    x: number;
    y: number;
    width: number;
    height: number;
    scale: number;
    plots: PlotData[];
    selectedId: string | null;
    onSelect: (id: string | null) => void;
    onMove: (id: string, x: number, y: number) => void;
    onResize: (id: string, width: number, height: number) => void;
}

export default function Garden({
    x,
    y,
    width,
    height,
    scale,
    plots,
    selectedId,
    onSelect,
    onMove,
    onResize,
}: GardenProps) {
    const trRef = useRef<Konva.Transformer>(null);
    const plotRefs = useRef<Record<string, Konva.Node>>({});

    const [isHovered, setIsHovered] = useState(false);

    const activeColor = '#4CAF50';
    const idleColor = '#333';

    const handleAttach = (id: string, node: Konva.Node | null) => {
        if (node) {
            plotRefs.current[id] = node;
        } else {
            delete plotRefs.current[id];
        }
    };

    useEffect(() => {
        const transformer = trRef.current;
        if (!transformer) return;

        const selectedNode = selectedId ? plotRefs.current[selectedId] : null;

        if (selectedNode) {
            transformer.nodes([selectedNode]);
            transformer.getLayer()?.batchDraw();
        } else {
            transformer.nodes([]);
            transformer.getLayer()?.batchDraw();
        }
    }, [selectedId]);

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
                text="Garden Area"
                fontSize={14 / scale}
                fill={isHovered ? activeColor : '#888'}
                fontStyle="bold"
            />
            {plots.map((plot) => (
                <Plot
                    key={plot.id}
                    {...plot}
                    gardenWidth={width}
                    gardenHeight={height}
                    onAttach={handleAttach}
                    isSelected={selectedId === plot.id}
                    onSelect={() => onSelect(plot.id)}
                    onDragEnd={(e) =>
                        onMove(plot.id, e.target.x(), e.target.y())
                    }
                    onTransformEnd={(e) => {
                        const node = e.target;
                        onResize(
                            plot.id,
                            node.width() * node.scaleX(),
                            node.height() * node.scaleY()
                        );
                        node.setAttrs({ scaleX: 1, scaleY: 1 });
                    }}
                />
            ))}

            <Transformer
                ref={trRef}
                rotateEnabled={false}
                keepRatio={false}
                boundBoxFunc={(oldBox, newBox) => {
                    if (newBox.width < 20 || newBox.height < 20) return oldBox;
                    return newBox;
                }}
            />
        </Group>
    );
}
