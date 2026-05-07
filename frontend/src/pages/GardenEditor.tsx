import { useState } from 'react';

import { useGardenData } from '../hooks/useGardenData';

import EditorLayout from '../components/layout/EditorLayout';
import Canvas from '../components/Canvas';
import Garden from '../components/Garden';
import Plot from '../components/Plot';
import FeaturePanel from '../components/FeaturePanel';
import GardenNameModal from '../components/GardenNameModal';

export default function GardenEditor() {
    const { gardens, plots, addGarden, addPlot, handleMove, handleResize } =
        useGardenData();
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const [isNaming, setIsNaming] = useState(false);
    const [pendingCoords, setPendingCoords] = useState({ x: 0, y: 0 });

    const triggerNamingModal = (x: number, y: number) => {
        setPendingCoords({ x, y });
        setIsNaming(true);
    };

    const handleConfirmName = (name: string) => {
        addGarden(name, pendingCoords.x, pendingCoords.y);
        setIsNaming(false);
    };

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
                                        {/* {plots
                                            .filter(
                                                (plot) =>
                                                    plot.gardenId === garden.id
                                            )
                                            .map((plot) => (
                                                <Plot
                                                    key={plot.id}
                                                    {...plot}
                                                    gardenWidth={width}
                                                    gardenHeight={height}
                                                    onAttach={handleAttach}
                                                    isSelected={
                                                        selectedId === plot.id
                                                    }
                                                    onSelect={() =>
                                                        onSelect(plot.id)
                                                    }
                                                    onDragEnd={(e) =>
                                                        onMove(
                                                            plot.id,
                                                            e.target.x(),
                                                            e.target.y()
                                                        )
                                                    }
                                                    onTransformEnd={(e) => {
                                                        const node = e.target;
                                                        onResize(
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
                                                />
                                            ))} */}
                                    </Garden>
                                ))}
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
