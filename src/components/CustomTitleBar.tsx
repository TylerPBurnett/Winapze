import { useState, useEffect } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Minus, Square, X, Copy } from "lucide-react";

/**
 * Custom title bar for the main dashboard window only.
 * Features:
 * - 32px height with theme-aware background
 * - Draggable middle area
 * - Window controls on the right (Minimize, Maximize/Restore, Close)
 * - No navigation buttons (dashboard only shows app list)
 */
export default function CustomTitleBar() {
  const [isMaximized, setIsMaximized] = useState(false);
  const appWindow = getCurrentWindow();

  useEffect(() => {
    console.log("[CustomTitleBar] Initializing title bar");
    
    // Check initial maximized state
    const checkMaximized = async () => {
      try {
        const maximized = await appWindow.isMaximized();
        console.log("[CustomTitleBar] Initial maximized state:", maximized);
        setIsMaximized(maximized);
      } catch (err) {
        console.error("[CustomTitleBar] Error checking maximized state:", err);
      }
    };
    checkMaximized();

    // Listen for window resize events to update maximize state
    const unlisten = appWindow.onResized(async () => {
      try {
        const maximized = await appWindow.isMaximized();
        setIsMaximized(maximized);
      } catch (err) {
        console.error("[CustomTitleBar] Error on resize:", err);
      }
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, [appWindow]);

  const handleMinimize = async () => {
    console.log("[CustomTitleBar] Minimize clicked");
    try {
      await appWindow.minimize();
    } catch (err) {
      console.error("[CustomTitleBar] Error minimizing:", err);
    }
  };

  const handleMaximize = async () => {
    console.log("[CustomTitleBar] Maximize/Restore clicked, current state:", isMaximized);
    try {
      await appWindow.toggleMaximize();
    } catch (err) {
      console.error("[CustomTitleBar] Error toggling maximize:", err);
    }
  };

  const handleClose = async () => {
    console.log("[CustomTitleBar] Close clicked");
    try {
      await appWindow.close();
    } catch (err) {
      console.error("[CustomTitleBar] Error closing:", err);
    }
  };

  return (
    <div className="custom-titlebar">
      {/* Left spacer - can add logo/title here later */}
      <div className="titlebar-left">
        <span className="titlebar-title">WebCatalog</span>
      </div>

      {/* Draggable area in the middle */}
      <div className="titlebar-drag-region" data-tauri-drag-region />

      {/* Window controls on the right */}
      <div className="titlebar-controls">
        <button
          className="titlebar-button titlebar-minimize"
          onClick={handleMinimize}
          title="Minimize"
        >
          <Minus size={14} />
        </button>
        <button
          className="titlebar-button titlebar-maximize"
          onClick={handleMaximize}
          title={isMaximized ? "Restore" : "Maximize"}
        >
          {isMaximized ? <Copy size={12} /> : <Square size={12} />}
        </button>
        <button
          className="titlebar-button titlebar-close"
          onClick={handleClose}
          title="Close"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
