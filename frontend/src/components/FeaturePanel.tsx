import { useState } from 'react';
import PlantLibrary from './PlantLibrary';
import AIChatbot from './AIChatbot';

export default function FeaturePanel() {
    const [activeTab, setActiveTab] = useState<'chat' | 'plants'>('plants');

    return (
        <div className="bg-bg-main flex flex-col h-full w-full font-sans">
            <div className="flex border-b border-border-main w-full">
                <button
                    onClick={() => setActiveTab('chat')}
                    className={`flex-1 py-3 text-sm font-medium transition-all cursor-pointer text-center ${
                        activeTab === 'chat'
                            ? 'text-text-header border-b-2 border-accent bg-code-bg/30'
                            : 'text-text-main/60 hover:text-text-header hover:bg-code-bg/10'
                    }`}
                >
                    💬 AI Chatbot
                </button>
                <button
                    onClick={() => setActiveTab('plants')}
                    className={`flex-1 py-3 text-sm font-medium transition-all cursor-pointer text-center ${
                        activeTab === 'plants'
                            ? 'text-text-header border-b-2 border-accent bg-code-bg/30'
                            : 'text-text-main/60 hover:text-text-header hover:bg-code-bg/10'
                    }`}
                >
                    🌿 Plant Library
                </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto">
                <div className={activeTab === 'chat' ? 'h-full' : 'hidden'}>
                    <AIChatbot />
                </div>
                <div className={activeTab === 'plants' ? 'h-full' : 'hidden'}>
                    <PlantLibrary />
                </div>
            </div>
        </div>
    );
}
