import { useState } from 'react';
import { getResizedImageUrl } from '../lib/utils';
import { type Plant } from '../types/garden';
import PlantInfoPopup from './PlantInfoPopUp'

export default function PlantCard({ plant }: { plant: Plant }) {
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    const handleDragStart = (e: React.DragEvent) => {
        const isTree = plant.type?.toLowerCase() === 'tree';

        e.dataTransfer.setData('application/react-garden-plant', JSON.stringify(plant));
        e.dataTransfer.setData(`plant-type-${plant.type?.toLowerCase() || 'vegetable'}`, 'true');
        e.dataTransfer.effectAllowed = 'move';

        const dragIcon = document.createElement('div');
        dragIcon.innerHTML = isTree ? '🌳' : '🌱';
        dragIcon.style.fontSize = isTree ? '48px' : '32px';
        dragIcon.style.position = 'absolute';
        dragIcon.style.top = '-1000px';
        dragIcon.style.opacity = '0.6';
        document.body.appendChild(dragIcon);

        const offset = isTree ? 24 : 16;
        e.dataTransfer.setDragImage(dragIcon, offset, offset);

        setTimeout(() => {
            document.body.removeChild(dragIcon);
        }, 0);
    };

    return (
        <>
            <div
                onClick={() => setIsPopupOpen(true)}
                className="w-full bg-code-bg/40 border border-border-main rounded-xl overflow-hidden cursor-pointer hover:border-leaf-green transition-colors shadow-sm font-sans"
            >
                <div className="p-3">
                    <div className="w-2/3 aspect-square mx-auto mb-3">
                        {plant.image_url ? (
                            <img
                                src={getResizedImageUrl(plant.image_url, 200, 200)}
                                alt={plant.common_name}
                                className="w-full h-full object-cover rounded-lg border border-border-main/40 shadow-inner"
                                draggable
                                onDragStart={handleDragStart}
                            />
                        ) : (
                            <div className="w-full h-full bg-code-bg rounded-lg flex items-center justify-center border border-border-main/20">
                                <span className="text-3xl">🌿</span>
                            </div>
                        )}
                    </div>
                    <div className="text-text-header font-semibold text-sm leading-tight mb-0.5">{plant.common_name}</div>
                    <div className="text-text-main/70 text-xs italic mb-2.5">{plant.scientific_name}</div>

                    <div className="flex gap-1.5 flex-wrap mb-3">
                        {plant.sunlight && (
                            <span className="text-[11px] px-2 py-0.5 bg-code-bg text-text-main rounded-md border border-border-main/30">
                                ☀️ {plant.sunlight}
                            </span>
                        )}
                        {plant.watering && (
                            <span className="text-[11px] px-2 py-0.5 bg-code-bg text-text-main rounded-md border border-border-main/30">
                                💧 {plant.watering}
                            </span>
                        )}
                        {plant.care_level && (
                            <span className="text-[11px] px-2 py-0.5 bg-code-bg text-text-main rounded-md border border-border-main/30">
                                🌱 {plant.care_level}
                            </span>
                        )}
                        {plant.growth_rate && (
                            <span className="text-[11px] px-2 py-0.5 bg-code-bg text-text-main rounded-md border border-border-main/30">
                                ⚡ {plant.growth_rate}
                            </span>
                        )}
                    </div>

                    <div className="pt-2 border-t border-border-main/60 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-wider text-text-main/70 font-mono">
                        {plant.type && (
                            <span className="bg-code-bg/80 px-1.5 py-0.5 rounded text-accent">{plant.type}</span>
                        )}
                        {(plant.edible_fruit || plant.edible_leaf) && (
                            <span className="text-leaf-green font-semibold h-full flex items-center">EDIBLE</span>
                        )}
                        {plant.flowers && (
                            <span className="text-leaf-green font-semibold h-full flex items-center">BLOOMS</span>
                        )}
                    </div>
                </div>
            </div>
            {isPopupOpen && <PlantInfoPopup plant={plant} onClose={() => setIsPopupOpen(false)} />}
        </>
    );
}