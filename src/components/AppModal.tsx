import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface AppModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string, url: string, icon: string) => void;
    initialData?: { name: string; url: string; icon: string };
    title: string;
    submitLabel: string;
}

const AppModal: React.FC<AppModalProps> = ({ isOpen, onClose, onSave, initialData, title, submitLabel }) => {
    const [name, setName] = useState("");
    const [url, setUrl] = useState("");
    const [icon, setIcon] = useState("");

    useEffect(() => {
        if (isOpen) {
            setName(initialData?.name || "");
            setUrl(initialData?.url || "");
            setIcon(initialData?.icon || "");
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(name, url, icon);
        onClose();
    };

    return (
        <div className="absolute inset-0 bg-overlay backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-surface border border-surface-border rounded-2xl w-full max-w-md shadow-2xl p-6 transform transition-all scale-100">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-text-primary">{title}</h2>
                    <button onClick={onClose} className="p-2 rounded-full transition-colors hover:bg-surface-hover">
                        <X size={20} className="text-text-secondary" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-text-secondary">App Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Notion"
                            className="w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-input border border-input-border text-text-primary"
                            autoFocus
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-text-secondary">URL</label>
                        <input
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="e.g. notion.so"
                            className="w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-input border border-input-border text-text-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-text-secondary">Icon URL (Optional)</label>
                        <input
                            type="text"
                            value={icon}
                            onChange={(e) => setIcon(e.target.value)}
                            placeholder="https://example.com/icon.png"
                            className="w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-input border border-input-border text-text-primary"
                        />
                    </div>

                    <div className="flex justify-end gap-3 mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl transition-colors text-text-secondary hover:bg-surface-hover"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 rounded-xl bg-primary hover:bg-primary-hover text-primary-text font-medium shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
                        >
                            {submitLabel}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AppModal;
