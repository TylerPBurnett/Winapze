(function() {
  'use strict';
  
  // Wait for both DOM and Tauri API to be ready
  function waitForTauri(callback) {
    if (window.__TAURI__) {
      callback();
    } else {
      setTimeout(() => waitForTauri(callback), 50);
    }
  }
  
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => waitForTauri(initTitleBar));
    } else {
      waitForTauri(initTitleBar);
    }
  }
  
  function initTitleBar() {
    // Check if title bar already exists
    if (document.getElementById('custom-app-titlebar')) {
      console.log('[TitleBar] Already initialized');
      return;
    }
    
    console.log('[TitleBar] Initializing custom title bar');
    // Create title bar HTML
    const titleBar = document.createElement('div');
    titleBar.id = 'custom-app-titlebar';
    titleBar.setAttribute('data-tauri-drag-region', '');
    
    titleBar.innerHTML = `
      <style>
        #custom-app-titlebar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 40px;
          background-color: #ffffff;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          z-index: 999999;
          user-select: none;
          -webkit-user-select: none;
          -webkit-app-region: drag;
        }
        
        #custom-app-titlebar * {
          -webkit-app-region: no-drag;
        }
        
        .titlebar-nav-controls {
          display: flex;
          align-items: center;
          gap: 2px;
          padding-left: 8px;
          height: 100%;
        }
        
        .titlebar-nav-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 32px;
          border: none;
          background: transparent;
          color: #64748b;
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.15s ease;
        }
        
        .titlebar-nav-button:hover {
          background-color: #f1f5f9;
          color: #0f172a;
        }
        
        .titlebar-nav-button:active {
          background-color: #e2e8f0;
          transform: scale(0.95);
        }
        
        .titlebar-center {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          padding: 0 12px;
          -webkit-app-region: drag;
        }
        
        .titlebar-app-name {
          font-size: 13px;
          font-weight: 600;
          color: #0f172a;
          letter-spacing: 0.01em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }
        
        .titlebar-controls {
          display: flex;
          align-items: center;
          height: 100%;
        }
        
        .titlebar-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 46px;
          height: 100%;
          border: none;
          background: transparent;
          color: #64748b;
          cursor: pointer;
          transition: background-color 0.15s ease, color 0.15s ease;
        }
        
        .titlebar-button:hover {
          background-color: #f1f5f9;
          color: #0f172a;
        }
        
        .titlebar-button:active {
          background-color: #e2e8f0;
        }
        
        .titlebar-close:hover {
          background-color: #e81123;
          color: white;
        }
        
        .titlebar-close:active {
          background-color: #bf0f1d;
        }
        
        .icon {
          width: 16px;
          height: 16px;
        }
        
        .icon-sm {
          width: 14px;
          height: 14px;
        }
        
        .icon-xs {
          width: 12px;
          height: 12px;
        }
        
        /* Offset body to account for fixed titlebar */
        body {
          padding-top: 40px !important;
        }
      </style>
      
      <div class="titlebar-nav-controls">
        <button class="titlebar-nav-button" id="nav-back" title="Back">
          <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button class="titlebar-nav-button" id="nav-forward" title="Forward">
          <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <button class="titlebar-nav-button" id="nav-refresh" title="Refresh">
          <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
        <button class="titlebar-nav-button" id="nav-home" title="Home">
          <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </button>
      </div>
      
      <div class="titlebar-center">
        <span class="titlebar-app-name">${window.APP_NAME || 'App'}</span>
      </div>
      
      <div class="titlebar-controls">
        <button class="titlebar-button titlebar-minimize" id="window-minimize" title="Minimize">
          <svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
          </svg>
        </button>
        <button class="titlebar-button titlebar-maximize" id="window-maximize" title="Maximize">
          <svg class="icon-xs" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke-width="2" />
          </svg>
        </button>
        <button class="titlebar-button titlebar-close" id="window-close" title="Close">
          <svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    `;
    
    // Insert at the beginning of body
    if (!document.body) {
      console.error('[TitleBar] document.body not available');
      return;
    }
    document.body.insertBefore(titleBar, document.body.firstChild);
    
    // Get Tauri API
    if (!window.__TAURI__ || !window.__TAURI__.window) {
      console.error('[TitleBar] Tauri API not available');
      return;
    }
    const { getCurrentWindow } = window.__TAURI__.window;
    const appWindow = getCurrentWindow();
    
    console.log('[TitleBar] Title bar initialized successfully');
    
    // Navigation handlers
    document.getElementById('nav-back').addEventListener('click', () => {
      try {
        console.log('[TitleBar] Back button clicked');
        window.history.back();
      } catch (e) {
        console.error('[TitleBar] Error going back:', e);
      }
    });
    
    document.getElementById('nav-forward').addEventListener('click', () => {
      try {
        console.log('[TitleBar] Forward button clicked');
        window.history.forward();
      } catch (e) {
        console.error('[TitleBar] Error going forward:', e);
      }
    });
    
    document.getElementById('nav-refresh').addEventListener('click', () => {
      try {
        console.log('[TitleBar] Refresh button clicked');
        window.location.reload();
      } catch (e) {
        console.error('[TitleBar] Error refreshing:', e);
      }
    });
    
    document.getElementById('nav-home').addEventListener('click', () => {
      try {
        console.log('[TitleBar] Home button clicked, HOME_URL:', window.HOME_URL);
        if (window.HOME_URL) {
          window.location.href = window.HOME_URL;
        }
      } catch (e) {
        console.error('[TitleBar] Error going home:', e);
      }
    });
    
    // Window control handlers
    document.getElementById('window-minimize').addEventListener('click', () => {
      appWindow.minimize();
    });
    
    document.getElementById('window-maximize').addEventListener('click', async () => {
      await appWindow.toggleMaximize();
      updateMaximizeIcon();
    });
    
    document.getElementById('window-close').addEventListener('click', () => {
      appWindow.close();
    });
    
    // Update maximize/restore icon
    async function updateMaximizeIcon() {
      const isMaximized = await appWindow.isMaximized();
      const btn = document.getElementById('window-maximize');
      
      if (isMaximized) {
        btn.innerHTML = `
          <svg class="icon-xs" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="5" y="5" width="14" height="14" rx="1" ry="1" stroke-width="2" />
            <path d="M7 7V5a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2h-2" stroke-width="2" />
          </svg>
        `;
        btn.title = 'Restore';
      } else {
        btn.innerHTML = `
          <svg class="icon-xs" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke-width="2" />
          </svg>
        `;
        btn.title = 'Maximize';
      }
    }
    
    // Listen for window resize events
    appWindow.onResized(updateMaximizeIcon);
    
    // Initial icon state
    updateMaximizeIcon();
  }
  
  // Start initialization
  init();
})();
