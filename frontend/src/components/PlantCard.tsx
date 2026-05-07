import { getResizedImageUrl } from '../lib/utils'

export interface Plant {
  perenual_id: number
  common_name: string
  scientific_name?: string | null
  watering?: string | null
  sunlight?: string | null
  care_level?: string | null
  image_url?: string | null
}

export default function PlantCard({ plant }: { plant: Plant }) {
  return (
    <div className="w-full bg-gray-800 border border-gray-600 rounded-lg overflow-hidden cursor-pointer hover:border-green-400 transition-colors">
      <div className="p-3">
        <div className="w-2/3 aspect-square mx-auto mb-3">
          {plant.image_url ? (
            <img
              src={getResizedImageUrl(plant.image_url, 200, 200)}
              alt={plant.common_name}
              className="w-full h-full object-cover rounded-md"
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
          {plant.sunlight && (
            <span className="text-xs text-gray-400">☀️ {plant.sunlight}</span>
          )}
          {plant.watering && (
            <span className="text-xs text-gray-400">💧 {plant.watering}</span>
          )}
          {plant.care_level && (
            <span className="text-xs text-gray-400">🌱 {plant.care_level}</span>
          )}
        </div>
      </div>
    </div>
  )
}
