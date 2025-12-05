import React from 'react';
import { Trash2, Globe } from 'lucide-react';

interface AppItem {
    id: number;
    name: string;
    url: string;
    icon: string;
}

interface AppCardProps {
    app: AppItem;
    onClick: (app: AppItem) => void;
    onDelete: (e: React.MouseEvent, id: number) => void;
    onContextMenu: (e: React.MouseEvent, app: AppItem) => void;
}

const AppCard: React.FC<AppCardProps> = ({ app, onClick, onDelete, onContextMenu }) => {

    return (
        <div
            onClick={() => onClick(app)}
            onContextMenu={(e) => onContextMenu(e, app)}
            className="group relative rounded-2xl p-5 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 cursor-pointer border bg-surface border-surface-border hover:border-primary/30"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl font-bold text-white shadow-lg overflow-hidden">
                    {app.icon.startsWith("http") ? (
                        <img src={app.icon} alt={app.name} className="w-full h-full object-cover" />
                    ) : (
                        app.icon
                    )}
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    {/* Delete button can still be here for quick access, or removed if context menu is preferred only */}
                    <button
                        onClick={(e) => onDelete(e, app.id)}
                        className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-full transition-colors text-text-secondary"
                        title="Delete App"
                    >
                        <Trash2 size={16} />
                    </button>
                    <button className="p-2 rounded-full transition-colors hover:bg-surface-hover text-text-secondary">
                        <Globe size={16} />
                    </button>
                </div>
            </div>
            <h3 className="text-lg font-semibold mb-1 text-text-primary">{app.name}</h3>
            <p className="text-sm truncate text-text-secondary">{app.url}</p>
        </div>
    );
};

export default AppCard;
