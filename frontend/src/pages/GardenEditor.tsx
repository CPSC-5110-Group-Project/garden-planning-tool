import { useState, useRef, useCallback } from 'react';
import Konva from 'konva';
import { useGardenData } from '../hooks/useGardenData';
import { PIXELS_PER_FOOT } from '../lib/utils';
import { type Plant } from '../types/garden';

import EditorLayout from '../components/layout/EditorLayout';
import Canvas from '../components/Canvas';
import Garden from '../components/Garden';
import Plot from '../components/Plot';
import FeaturePanel from '../components/FeaturePanel';
import GardenNameModal from '../components/GardenNameModal';
import PlantTooltip from '../components/PlantTooltip';

export default function GardenEditor() {
    const { gardens, addGarden, handleMove, handleResize, addPlant } = useGardenData();
    const [timelineDays, setTimelineDays] = useState<number>(0);
    const [activeDragPlot, setActiveDragPlot] = useState<{
        gardenId: string;
        plotKey: string;
    } | null>(null);
    const [hoveredPlant, setHoveredPlant] = useState<{ plant: Plant; x: number; y: number } | null>(null);
    const [isNaming, setIsNaming] = useState(false);
    const [pendingCoords, setPendingCoords] = useState({ x: 0, y: 0 });

    const stageRef = useRef<Konva.Stage>(null);

    const triggerNamingModal = (x: number, y: number) => {
        setPendingCoords({ x, y });
        setIsNaming(true);
    };

    const handleConfirmName = (name: string) => {
        addGarden(name, pendingCoords.x, pendingCoords.y);
        setIsNaming(false);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        const stage = stageRef.current;
        if (!stage) return;

        stage.setPointersPositions(e);
        const pos = stage.getRelativePointerPosition();
        if (!pos) return;

        const hit = findPlotAt(pos);
        if (hit) {
            if (activeDragPlot?.plotKey !== hit.plotKey || activeDragPlot?.gardenId !== hit.gardenId) {
                setActiveDragPlot({ gardenId: hit.gardenId, plotKey: hit.plotKey });
            }
        } else if (activeDragPlot) {
            setActiveDragPlot(null);
        }
    };

    const handlePlantMouseOver = useCallback((plant: Plant, x: number, y: number) => {
        setHoveredPlant({ plant, x, y });
    }, []);

    const handlePlantMouseOut = useCallback(() => {
        setHoveredPlant(null);
    }, []);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const rawData = e.dataTransfer.getData('application/react-garden-plant');
        if (!rawData || !stageRef.current) return;

        stageRef.current.setPointersPositions(e);
        const pos = stageRef.current.getRelativePointerPosition();
        if (!pos) return;

        const hit = findPlotAt(pos);
        if (hit && !hit.garden.plots[hit.plotKey]) {
            addPlant(hit.gardenId, hit.plotKey, JSON.parse(rawData));
        }
        setActiveDragPlot(null);
    };

    const findPlotAt = (pos: { x: number; y: number }) => {
        for (const garden of Object.values(gardens)) {
            const gWidth = garden.cols * PIXELS_PER_FOOT;
            const gHeight = garden.rows * PIXELS_PER_FOOT;

            if (pos.x >= garden.x && pos.x <= garden.x + gWidth && pos.y >= garden.y && pos.y <= garden.y + gHeight) {
                const col = Math.floor((pos.x - garden.x) / PIXELS_PER_FOOT);
                const row = Math.floor((pos.y - garden.y) / PIXELS_PER_FOOT);
                return {
                    gardenId: garden.id,
                    plotKey: `${row}-${col}`,
                    garden,
                };
            }
        }
        return null;
    };

    return (
        <>
            <EditorLayout
                header={
                    <div className="flex justify-between items-center w-full px-2">
                        <h1 className="text-xl font-bold text-text-header m-0">Garden Planning Tool</h1>

                        <div className="flex items-center gap-4 bg-gray-800 px-4 py-1.5 rounded-lg border border-gray-700">
                            <span className="text-xs text-gray-300 font-medium whitespace-nowrap">
                                Preview: {timelineDays === 0 ? 'Today' : `+${timelineDays} Days`}
                            </span>
                            <input
                                type="range"
                                min="0"
                                max="180"
                                value={timelineDays}
                                onChange={(e) => setTimelineDays(Number(e.target.value))}
                                className="w-48 accent-green-500 cursor-pointer h-1 bg-gray-600 rounded-lg appearance-none"
                            />
                        </div>
                    </div>
                }
                sidebar={
                    <div className="p-4 flex flex-col gap-4">
                        <div className="h-px bg-border-main w-full" />
                    </div>
                }
                panel={<FeaturePanel />}
                canvas={
                    <Canvas
                        ref={stageRef}
                        onAddGarden={triggerNamingModal}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                    >
                        {() =>
                            Object.values(gardens).map((garden) => (
                                <Garden key={garden.id} {...garden} handleMove={handleMove} handleResize={handleResize}>
                                    {Array.from({ length: garden.rows }).map((_, r) =>
                                        Array.from({ length: garden.cols }).map((_, c) => {
                                            const plotKey = `${r}-${c}`;
                                            return (
                                                <Plot
                                                    key={`${garden.id}-${plotKey}`}
                                                    x={c * PIXELS_PER_FOOT}
                                                    y={r * PIXELS_PER_FOOT}
                                                    data={garden.plots[plotKey]}
                                                    isDraggingOver={
                                                        activeDragPlot?.gardenId === garden.id &&
                                                        activeDragPlot?.plotKey === plotKey
                                                    }
                                                    timelineDays={timelineDays}
                                                    onPlantMouseOver={handlePlantMouseOver}
                                                    onPlantMouseOut={handlePlantMouseOut}
                                                />
                                            );
                                        })
                                    )}
                                </Garden>
                            ))
                        }
                    </Canvas>
                }
                footer={
                    <div className="flex justify-between items-center w-full text-[10px] uppercase tracking-widest text-text-main/60 px-2 h-full">
                        <span>Workspace • Canvas Mode</span>
                        <span>{Object.keys(gardens).length} Total Gardens</span>
                    </div>
                }
            />
            {isNaming && <GardenNameModal onConfirm={handleConfirmName} onCancel={() => setIsNaming(false)} />}
            {hoveredPlant && <PlantTooltip data={hoveredPlant} />}
        </>
    );
}
