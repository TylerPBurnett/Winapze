import React from 'react';

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

const AppCard: React.FC<AppCardProps> = ({ app, onClick, onContextMenu }) => {
    const isImage = app.icon.startsWith("http");

    // Background classes: Transparent for images, Gradient for text fallback
    const bgClasses = isImage
        ? 'bg-transparent shadow-none'
        : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-black/10';

    return (
        <div
            onContextMenu={(e) => onContextMenu(e, app)}
            className="group flex flex-col items-center gap-3 p-2 rounded-xl transition-all duration-300"
        >
            <div
                onClick={() => onClick(app)}
                className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold overflow-hidden transition-transform hover:scale-105 hover:shadow-xl cursor-pointer ${bgClasses}`}
            >
                {isImage ? (
                    <img src={app.icon} alt={app.name} className="w-full h-full object-cover rounded-2xl" />
                ) : (
                    app.icon
                )}
            </div>
            <h3 className="text-sm font-medium text-text-primary text-center leading-tight">{app.name}</h3>
        </div>
    );
};

export default AppCard;
