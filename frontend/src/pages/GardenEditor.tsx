import { useState, useEffect, useRef } from 'react';
import { useGardenData } from '../hooks/useGardenData';
import { Transformer } from 'react-konva';
import Konva from 'konva';

import EditorLayout from '../components/layout/EditorLayout';
import Canvas from '../components/Canvas';
import Garden from '../components/Garden';
import Plot from '../components/Plot';
import Plant from '../components/Plant';
import FeaturePanel from '../components/FeaturePanel';
import GardenNameModal from '../components/GardenNameModal';

export default function GardenEditor() {
    const { gardens, plots, addGarden, addPlot, handleMove, handleResize } =
        useGardenData();
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const [isNaming, setIsNaming] = useState(false);
    const [pendingCoords, setPendingCoords] = useState({ x: 0, y: 0 });
    const trRef = useRef<Konva.Transformer>(null);
    const plotRefs = useRef<Record<string, Konva.Node>>({});

    const triggerNamingModal = (x: number, y: number) => {
        setPendingCoords({ x, y });
        setIsNaming(true);
    };

    const handleConfirmName = (name: string) => {
        addGarden(name, pendingCoords.x, pendingCoords.y);
        setIsNaming(false);
    };

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
        <>
            <EditorLayout
                header={
                    <div className="flex justify-between items-center w-full px-2">
                        <h1 className="text-xl font-bold text-text-header m-0">
                            Garden Planning Tool
                        </h1>
                    </div>
                }
                sidebar={
                    <div className="p-4 flex flex-col gap-4">
                        <div className="h-px bg-border-main w-full" />
                    </div>
                }
                panel={<FeaturePanel />}
                canvas={
                    <Canvas onAddGarden={triggerNamingModal}>
                        {(_size, scale) => (
                            <>
                                {gardens.map((garden) => (
                                    <Garden
                                        key={garden.id}
                                        name={garden.name}
                                        x={garden.x}
                                        y={garden.y}
                                        width={garden.dimensions.width}
                                        height={garden.dimensions.height}
                                        scale={scale}
                                        selectedId={selectedId}
                                    >
                                        {plots.map((plot) => (
                                            <Plot
                                                key={plot.id}
                                                {...plot}
                                                gardenWidth={
                                                    garden.dimensions.width
                                                }
                                                gardenHeight={
                                                    garden.dimensions.height
                                                }
                                                onAttach={handleAttach}
                                                isSelected={
                                                    selectedId === plot.id
                                                }
                                                onSelect={() =>
                                                    setSelectedId(plot.id)
                                                }
                                                onDragEnd={(e) =>
                                                    handleMove(
                                                        plot.id,
                                                        e.target.x(),
                                                        e.target.y()
                                                    )
                                                }
                                                onTransformEnd={(e) => {
                                                    const node = e.target;
                                                    handleResize(
                                                        plot.id,
                                                        node.width() *
                                                            node.scaleX(),
                                                        node.height() *
                                                            node.scaleY()
                                                    );
                                                    node.setAttrs({
                                                        scaleX: 1,
                                                        scaleY: 1,
                                                    });
                                                }}
                                            >
                                                {plot.plants.map((_, i) => (
                                                    <Plant
                                                        key={i}
                                                        index={i}
                                                        parentWidth={plot.width}
                                                    />
                                                ))}
                                            </Plot>
                                        ))}
                                    </Garden>
                                ))}
                                <Transformer
                                    ref={trRef}
                                    rotateEnabled={false}
                                    keepRatio={false}
                                    boundBoxFunc={(oldBox, newBox) => {
                                        if (
                                            newBox.width < 20 ||
                                            newBox.height < 20
                                        )
                                            return oldBox;
                                        return newBox;
                                    }}
                                />
                            </>
                        )}
                    </Canvas>
                }
                footer={
                    <div className="flex justify-between items-center w-full text-[10px] uppercase tracking-widest text-text-main/60 px-2 h-full">
                        <span>Workspace • Canvas Mode</span>
                        <button
                            onClick={addPlot}
                            className="bg-accent text-white px-3 py-1 rounded hover:opacity-90 active:scale-95 transition-all font-bold"
                        >
                            + Add Plot
                        </button>
                        <span>{plots.length} Total Plots</span>
                    </div>
                }
            />
            {isNaming && (
                <GardenNameModal
                    onConfirm={handleConfirmName}
                    onCancel={() => setIsNaming(false)}
                />
            )}
        </>
    );
}
