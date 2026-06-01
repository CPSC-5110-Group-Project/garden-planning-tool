import { useState, useEffect } from 'react'
import { getResizedImageUrl } from '../lib/utils'
import { type Plant } from '../types/garden'

interface Props {
    plant: Plant
    onClose: () => void
}

function Badge({ label }: { label: string }) {
    return <span className="text-xs bg-code-bg text-text-main px-2 py-1 rounded border border-border-main/30">{label}</span>
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="mb-4">
            <h3 className="text-text-main/50 text-xs font-semibold uppercase tracking-wider mb-2">{title}</h3>
            {children}
        </div>
    )
}

export default function PlantInfoPopup({ plant, onClose }: Props) {
    const fullImageUrl = plant.image_url ?? null
    const thumbnailImageUrl = fullImageUrl ? getResizedImageUrl(fullImageUrl, 200, 200) : null
    const [aiResult, setAiResult] = useState<{
        perenualId: Plant['perenual_id'] | null
        description: string | null
    }>({ perenualId: null, description: null })
    const [loadedImage, setLoadedImage] = useState<{
        sourceUrl: string | null
        displayUrl: string | null
    }>({ sourceUrl: null, displayUrl: null })

    const loadingAI = aiResult.perenualId !== plant.perenual_id
    const aiDescription = loadingAI ? null : aiResult.description
    const popupImageUrl = loadedImage.sourceUrl === fullImageUrl ? loadedImage.displayUrl : thumbnailImageUrl

    useEffect(() => {
        if (!fullImageUrl) return

        let cancelled = false
        const image = new Image()

        image.onload = () => {
            if (!cancelled) {
                setLoadedImage({
                    sourceUrl: fullImageUrl,
                    displayUrl: fullImageUrl,
                })
            }
        }
        image.src = fullImageUrl

        return () => {
            cancelled = true
        }
    }, [fullImageUrl])

    useEffect(() => {
        let cancelled = false

        fetch(`${import.meta.env.VITE_API_URL}/plants/${plant.perenual_id}/ai-description`)
            .then(res => res.json())
            .then(data => {
                if (!cancelled) {
                    setAiResult({
                        perenualId: plant.perenual_id,
                        description: data.description,
                    })
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setAiResult({
                        perenualId: plant.perenual_id,
                        description: null,
                    })
                }
            })

        return () => { cancelled = true }
    }, [plant.perenual_id])

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
            <div
                className="bg-bg-main border border-border-main rounded-xl p-6 w-[420px] max-h-[85vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-text-header text-lg font-semibold">{plant.common_name}</h2>
                        {plant.scientific_name && <p className="text-text-main/60 text-sm italic">{plant.scientific_name}</p>}
                    </div>
                    <button onClick={onClose} className="text-text-main/50 hover:text-text-header text-xl leading-none ml-4">✕</button>
                </div>

                {popupImageUrl && (
                    <img src={popupImageUrl} alt={plant.common_name} className="w-full rounded-lg mb-4 object-cover max-h-48" />
                )}

                <Section title="Care">
                    <div className="flex gap-2 flex-wrap">
                        {plant.sunlight && <Badge label={`☀️ ${plant.sunlight}`} />}
                        {plant.watering && <Badge label={`💧 ${plant.watering}`} />}
                        {plant.care_level && <Badge label={`🌱 ${plant.care_level}`} />}
                        {plant.growth_rate && <Badge label={`⚡ ${plant.growth_rate}`} />}
                    </div>
                </Section>

                {(plant.edible_fruit || plant.edible_leaf || plant.flowers || plant.type) && (
                    <Section title="Highlights">
                        <div className="flex gap-2 flex-wrap">
                            {plant.type && <Badge label={`🌿 ${plant.type}`} />}
                            {plant.edible_fruit && <Badge label="😋 Edible Fruit" />}
                            {plant.edible_leaf && <Badge label="🥗 Edible Leaf" />}
                            {plant.flowers && <Badge label="🌸 Flowers" />}
                        </div>
                    </Section>
                )}

                <Section title="🤖 AI Garden Advice">
                    {loadingAI
                        ? <p className="text-sm text-text-main/50 italic">Thinking...</p>
                        : aiDescription
                            ? <p className="text-sm text-text-main/70 leading-relaxed">{aiDescription}</p>
                            : <p className="text-sm text-text-main/40 italic">No advice available.</p>
                    }
                </Section>
            </div>
        </div>
    )
}
