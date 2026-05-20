import { useState } from 'react';
import { getResizedImageUrl } from '../lib/utils';
import { type Plant } from '../types/garden';
import PlantInfoPopup from './PlantInfoPopUp'

export default function PlantCard({ plant }: { plant: Plant }) {
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData('application/react-garden-plant', JSON.stringify(plant));
        e.dataTransfer.effectAllowed = 'move';

        const dragIcon = document.createElement('div');
        dragIcon.innerHTML = '🌱';
        dragIcon.style.fontSize = '32px';
        dragIcon.style.position = 'absolute';
        dragIcon.style.top = '-1000px';
        dragIcon.style.opacity = '0.6';
        document.body.appendChild(dragIcon);

        e.dataTransfer.setDragImage(dragIcon, 16, 16);
        setTimeout(() => {
            document.body.removeChild(dragIcon);
        }, 0);
    };
    return (
        <div 
            onClick={() => setIsPopupOpen(true)}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg overflow-hidden cursor-pointer hover:border-green-400 transition-colors">
            <div className="p-3">
                <div className="w-2/3 aspect-square mx-auto mb-3">
                    {plant.image_url ? (
                        <img
                            src={getResizedImageUrl(plant.image_url, 200, 200)}
                            alt={plant.common_name}
                            className="w-full h-full object-cover rounded-md"
                            draggable
                            onDragStart={handleDragStart}
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-700 rounded-md flex items-center justify-center">
                            <span className="text-3xl">🌿</span>
                        </div>
                    )}
                </div>
                <div className="text-white text-sm font-medium">{plant.common_name}</div>
                <div className="text-gray-400 text-xs italic mb-2">{plant.scientific_name}</div>
                <div className="flex gap-2 flex-wrap">
                    {plant.sunlight && <span className="text-xs text-gray-400">☀️ {plant.sunlight}</span>}
                    {plant.watering && <span className="text-xs text-gray-400">💧 {plant.watering}</span>}
                    {plant.care_level && <span className="text-xs text-gray-400">🌱 {plant.care_level}</span>}
                </div>
            </div>
            {isPopupOpen && <PlantInfoPopup plant={plant} onClose={() => setIsPopupOpen(false)} />}
        </div>
    );
}
