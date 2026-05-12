import { useState } from 'react'
import PlantLibrary from './PlantLibrary'
import AIChatbot from './AIChatbot'

export default function FeaturePanel() {
  const [activeTab, setActiveTab] = useState<'chat' | 'plants'>('plants')

  return (
    <div className="bg-code-bg flex flex-col h-full w-full">
      <div className="flex border-b border-gray-700 w-full">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-2 text-sm font-medium transition-colors ${activeTab === 'chat'
              ? 'text-green-400 border-b-2 border-green-400'
              : 'text-gray-400 hover:text-white'
            }`}
        >
          AI Chatbot
        </button>
        <button
          onClick={() => setActiveTab('plants')}
          className={`flex-1 py-2 text-sm font-medium transition-colors ${activeTab === 'plants'
              ? 'text-green-400 border-b-2 border-green-400'
              : 'text-gray-400 hover:text-white'
            }`}
        >
          Plant Library
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className={activeTab === 'chat' ? 'h-full' : 'hidden'}><AIChatbot /></div>
        <div className={activeTab === 'plants' ? 'h-full' : 'hidden'}><PlantLibrary /></div>

      </div>
    </div>
  )
}