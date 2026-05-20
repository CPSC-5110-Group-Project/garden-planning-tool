import { type Plant } from '../types/garden'

interface Props {
  plant: Plant
  onClose: () => void
}

export default function PlantInfoPopup({ plant, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-96 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-white text-lg font-semibold">{plant.common_name}</h2>
            <p className="text-gray-400 text-sm italic">{plant.scientific_name}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl leading-none">✕</button>
        </div>

        {plant.image_url && (
          <img src={plant.image_url} alt={plant.common_name} className="w-full rounded-lg mb-4 object-cover max-h-48" />
        )}

        <div className="flex gap-2 flex-wrap">
          {plant.sunlight && <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">☀️ {plant.sunlight}</span>}
          {plant.watering && <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">💧 {plant.watering}</span>}
          {plant.care_level && <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">🌱 {plant.care_level}</span>}
        </div>
      </div>
    </div>
  )
}