import { useState } from 'react';

interface ModalProps {
    onConfirm: (name: string) => void;
    onCancel: () => void;
}

export default function GardenNameModal({ onConfirm, onCancel }: ModalProps) {
    const [name, setName] = useState('');

    const handleSubmit = (e: React.BaseSyntheticEvent<SubmitEvent>) => {
        e.preventDefault();
        if (name.trim()) onConfirm(name);
    };

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black-forest-950/40 backdrop-blur-sm">
            <div className="bg-bg-main border border-border-main p-6 rounded-xl shadow-xl w-80 font-sans animate-fade-in">
                <h3 className="text-lg font-semibold mb-4 text-text-header">New Garden Name</h3>
                <form onSubmit={handleSubmit}>
                    <input
                        autoFocus
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-code-bg border border-border-main p-2 rounded-lg mb-4 text-text-header placeholder-text-main/40 outline-none focus:border-leaf-green transition-colors text-sm"
                        placeholder="Enter garden name..."
                    />
                    <div className="flex justify-end gap-1">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 text-sm text-text-main/60 hover:text-text-header transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!name.trim()}
                            className="bg-accent text-olive-leaf-50 px-4 py-2 rounded-lg text-sm font-semibold transition-opacity disabled:opacity-40 cursor-pointer hover:opacity-90 shadow-sm"
                        >
                            Create Garden
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
