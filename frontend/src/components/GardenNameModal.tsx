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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-bg-main border border-border-main p-6 rounded-lg shadow-xl w-80">
                <h3 className="text-lg font-bold mb-4 text-text-header">
                    New Garden Name
                </h3>
                <form onSubmit={handleSubmit}>
                    <input
                        autoFocus
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-code-bg border border-border-main p-2 rounded mb-4 text-text-main outline-none focus:border-accent"
                        placeholder="Enter garden name..."
                    />
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 text-sm text-text-main/60 hover:text-text-main"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!name.trim()}
                            className="bg-accent text-white px-4 py-2 rounded text-sm font-bold disabled:opacity-50"
                        >
                            Create Garden
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
