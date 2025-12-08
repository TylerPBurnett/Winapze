import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, RotateCw, Home, X, Minimize, Maximize } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { listen } from '@tauri-apps/api/event';

export default function BrowserToolbar() {
    const [initialUrl, setInitialUrl] = useState('');
    const [appName, setAppName] = useState('App');
    const [currentUrl, setCurrentUrl] = useState('');

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const url = params.get('url') || '';
        const name = params.get('name') || 'App';

        setInitialUrl(url);
        setCurrentUrl(url);
        setAppName(name);

        // Listen for state updates from the content webview (via Rust)
        const unlisten = listen('webview_state_update', (_event) => {
            // Future implementation
        });

        return () => {
            unlisten.then(f => f());
        };
    }, []);

    const handleBack = () => invoke('nav_back');
    const handleForward = () => invoke('nav_forward');
    const handleReload = () => invoke('nav_reload');

    const handleHome = () => {
        if (initialUrl) {
            invoke('navigate_to', { url: initialUrl });
            setCurrentUrl(initialUrl); // Optimistic update
        }
    };

    const handleMinimize = () => getCurrentWindow().minimize();
    const handleMaximize = () => getCurrentWindow().toggleMaximize();
    const handleClose = () => getCurrentWindow().close();

    return (
        <div
            className="fixed top-0 left-0 right-0 h-[50px] bg-background border-b border-border flex items-center px-2 gap-2 select-none z-50 overflow-hidden"
            style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
        >
            <div className="flex items-center gap-1" style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}>
                <button
                    onClick={handleBack}
                    className="p-2 rounded-md hover:bg-accent text-foreground transition-colors"
                    title="Back"
                >
                    <ArrowLeft size={18} />
                </button>
                <button
                    onClick={handleForward}
                    className="p-2 rounded-md hover:bg-accent text-foreground transition-colors"
                    title="Forward"
                >
                    <ArrowRight size={18} />
                </button>
                <button
                    onClick={handleReload}
                    className="p-2 rounded-md hover:bg-accent text-foreground transition-colors"
                    title="Reload"
                >
                    <RotateCw size={18} />
                </button>
                <button
                    onClick={handleHome}
                    className="p-2 rounded-md hover:bg-accent text-foreground transition-colors"
                    title="Home"
                >
                    <Home size={18} />
                </button>
            </div>

            <div
                className="flex-1 flex items-center justify-center px-4"
                style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
            >
                <div
                    className="bg-surface/50 border border-input-border rounded-lg px-3 py-1.5 text-sm text-text-secondary w-full max-w-xl text-center truncate flex items-center justify-center gap-2 pointer-events-none"
                    style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
                >
                    <span className="font-semibold text-text-primary mr-2">{appName}</span>
                    <span className="opacity-50 text-xs">{currentUrl || initialUrl}</span>
                </div>
            </div>

            <div className="flex items-center gap-1" style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}>
                <button
                    onClick={handleMinimize}
                    className="p-2 rounded-md hover:bg-accent text-foreground transition-colors"
                >
                    <Minimize size={16} />
                </button>
                <button
                    onClick={handleMaximize}
                    className="p-2 rounded-md hover:bg-accent text-foreground transition-colors"
                >
                    <Maximize size={16} />
                </button>
                <button
                    onClick={handleClose}
                    className="p-2 rounded-md hover:bg-red-500 hover:text-white text-foreground transition-colors"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
}
