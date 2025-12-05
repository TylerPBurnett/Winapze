import React, { useEffect, useRef } from 'react';
import { Edit2, Trash2 } from 'lucide-react';

interface ContextMenuProps {
    x: number;
    y: number;
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onClose, onEdit, onDelete }) => {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    return (
        <div
            ref={menuRef}
            className="absolute z-50 rounded-lg shadow-xl w-48 border py-1.5 focus:outline-none bg-surface border-surface-border text-text-primary backdrop-blur-md"
            style={{ top: y, left: x }}
        >
            <button
                onClick={() => { onEdit(); onClose(); }}
                className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors hover:bg-surface-hover hover:text-primary"
            >
                <Edit2 size={16} />
                Edit
            </button>
            <button
                onClick={() => { onDelete(); onClose(); }}
                className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 text-red-500 hover:text-red-600 hover:bg-surface-hover transition-colors"
            >
                <Trash2 size={16} />
                Delete
            </button>
        </div>
    );
};

export default ContextMenu;
