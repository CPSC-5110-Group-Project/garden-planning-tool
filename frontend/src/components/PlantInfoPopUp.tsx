import { type Plant } from '../types/garden'

interface Props {
  plant: Plant
  onClose: () => void
}

function Badge({ label }: { label: string }) {
    return <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">{label}</span>
}

function BooleanBadge({ label, icon }: { label: string; icon: string }) {
    return <span className="text-xs bg-gray-700 text-gray-200 px-2 py-1 rounded">{icon} {label}</span>
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="mb-4">
            <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">{title}</h3>
            {children}
        </div>
    )
}

export default function PlantInfoPopup({ plant, onClose }: Props) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-[420px] max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-white text-lg font-semibold">{plant.common_name}</h2>
                        {plant.scientific_name && <p className="text-gray-400 text-sm italic">{plant.scientific_name}</p>}
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-xl leading-none ml-4">✕</button>
                </div>

                {plant.image_url && (
                    <img src={plant.image_url} alt={plant.common_name} className="w-full rounded-lg mb-4 object-cover max-h-48" />
                )}

                <Section title="Care">
                    <div className="flex gap-2 flex-wrap">
                        {plant.sunlight && <Badge label={`☀️ ${plant.sunlight}`} />}
                        {plant.watering && <Badge label={`💧 ${plant.watering}`} />}
                        {plant.care_level && <Badge label={`🌱 ${plant.care_level}`} />}
                        {plant.cycle && <Badge label={`🔄 ${plant.cycle}`} />}
                        {plant.maintenance && <Badge label={`🔧 ${plant.maintenance}`} />}
                    </div>
                </Section>

                {(plant.poisonous_to_humans || plant.poisonous_to_pets) && (
                    <Section title="⚠️ Safety">
                        <div className="flex gap-2 flex-wrap">
                            {plant.poisonous_to_humans && <BooleanBadge icon="☠️" label="Toxic to Humans" />}
                            {plant.poisonous_to_pets && <BooleanBadge icon="🐾" label="Toxic to Pets" />}
                        </div>
                    </Section>
                )}

                {(plant.edible_fruit || plant.edible_leaf || plant.medicinal || plant.flowers || plant.attracts) && (
                    <Section title="Highlights">
                        <div className="flex gap-2 flex-wrap">
                            {plant.edible_fruit && <BooleanBadge icon="😋" label="Edible Fruit" />}
                            {plant.edible_leaf && <BooleanBadge icon="🥗" label="Edible Leaf" />}
                            {plant.medicinal && <BooleanBadge icon="💊" label="Medicinal" />}
                            {plant.flowers && <BooleanBadge icon="🌸" label="Flowers" />}
                            {plant.attracts && <Badge label={`🦋 Attracts: ${plant.attracts}`} />}
                        </div>
                    </Section>
                )}

                {plant.description && (
                    <Section title="About">
                        <p className="text-sm text-gray-300 leading-relaxed">{plant.description}</p>
                    </Section>
                )}
            </div>
        </div>
    )
}