# Custom Title Bar Implementation

## Overview

This WebCatalog clone uses custom title bars for both the main catalog window and individual app windows, providing a seamless, modern experience on Windows.

## Architecture

### Main Catalog Window
- **Component**: `CustomTitleBar.tsx`
- **Features**: 
  - Window controls (minimize, maximize, close) only
  - Draggable area
  - Theme-aware styling
  - 32px height

### App Windows
- **Component**: `app-window.html` (standalone HTML)
- **Features**:
  - Navigation controls (back, forward, refresh, home) on the left
  - App name displayed in center
  - Window controls (minimize, maximize, close) on the right
  - Fully draggable title bar area
  - 40px height to accommodate navigation buttons
  - Iframe-based content loading

## File Structure

```
src/
├── components/
│   ├── CustomTitleBar.tsx          # Main catalog title bar
│   └── AppWindowTitleBar.tsx       # React component (for reference)
├── App.css                         # Title bar styles
└── ...

app-window.html                     # Standalone HTML for app windows
src-tauri/
└── src/
    └── lib.rs                      # Window creation logic
```

## How It Works

### 1. Main Catalog Window

The main catalog uses a React component (`CustomTitleBar.tsx`) that:
- Sets `decorations: false` in `tauri.conf.json`
- Renders custom window controls
- Uses `data-tauri-drag-region` attribute for draggability

### 2. App Windows

App windows use a different approach due to loading external URLs:

1. **Rust Backend** (`lib.rs`):
   - Creates windows with `decorations(false)`
   - Loads `app-window.html` with URL parameters
   - Passes app name and URL via query string

2. **HTML Wrapper** (`app-window.html`):
   - Displays custom title bar at the top
   - Embeds external URL in an iframe below
   - Handles all navigation via JavaScript
   - Controls window state via Tauri API

## Key Configuration

### Tauri Config (`tauri.conf.json`)

```json
{
  "app": {
    "windows": [
      {
        "label": "main",
        "decorations": false,  // Removes default title bar
        "transparent": true     // Optional for modern look
      }
    ]
  }
}
```

### Rust Window Creation

```rust
tauri::WebviewWindowBuilder::new(
    app,
    &label,
    tauri::WebviewUrl::App(wrapper_url.into())
)
.decorations(false)  // No default title bar
.build()
```

### HTML Title Bar Structure

```html
<div id="custom-titlebar" data-tauri-drag-region>
  <div class="titlebar-nav-controls">
    <!-- Navigation buttons -->
  </div>
  <div class="titlebar-center" data-tauri-drag-region>
    <!-- App name -->
  </div>
  <div class="titlebar-controls">
    <!-- Window controls -->
  </div>
</div>
<iframe id="app-content"></iframe>
```

## Styling

### CSS Variables

The title bar respects theme variables:

```css
:root {
  --sidebar: #ffffff;           /* Title bar background */
  --sidebar-border: #e2e8f0;    /* Bottom border */
  --text-primary: #0f172a;      /* App name color */
  --text-secondary: #64748b;    /* Button icon color */
  --surface-hover: #f1f5f9;     /* Hover state */
}
```

### Dark Theme Support

Dark theme is automatically applied via CSS variables. Add theme switching by updating the CSS variables in JavaScript.

## Navigation Buttons

The app window title bar includes these navigation buttons:

- **Back** (←): Goes back in browser history
- **Forward** (→): Goes forward in browser history  
- **Refresh** (⟳): Reloads the current page
- **Home** (⌂): Returns to the app's home URL

All navigation is handled via iframe content window:

```javascript
iframe.contentWindow.history.back();
iframe.contentWindow.location.reload();
```

## Window Controls

### Minimize
Minimizes the window to taskbar:
```javascript
appWindow.minimize();
```

### Maximize/Restore
Toggles between maximized and restored states:
```javascript
await appWindow.toggleMaximize();
```

### Close
Closes the window:
```javascript
appWindow.close();
```

## Draggable Region

Areas marked with `data-tauri-drag-region` allow window dragging:

```html
<div data-tauri-drag-region>
  <!-- This area can drag the window -->
</div>
```

**Important**: Buttons and interactive elements should NOT have this attribute, or they won't be clickable.

## Customization

### Change Title Bar Height

In `app-window.html`:
```css
#custom-titlebar {
  height: 40px;  /* Adjust as needed */
}
```

### Change Button Styling

Modify button classes in `App.css`:
```css
.titlebar-nav-button {
  width: 40px;
  height: 32px;
  border-radius: 6px;
}

.titlebar-button {
  width: 46px;
}
```

### Add More Navigation Buttons

1. Add button HTML in `app-window.html`
2. Add click event listener in JavaScript
3. Implement navigation logic

## Browser Limitations

### Iframe Restrictions

Due to CORS and iframe security:
- Some sites may refuse to load in iframes (X-Frame-Options)
- Cross-origin iframe manipulation is limited
- Navigation state might not always be accessible

### Alternative: Webview

For better compatibility, consider using Tauri's webview directly instead of iframes, but this requires a different architecture with multiple window instances.

## Troubleshooting

### Title Bar Not Showing
- Check that `decorations: false` is set
- Verify the HTML file is in the correct location
- Check browser console for errors

### Navigation Not Working
- Ensure iframe has loaded successfully
- Check for CORS errors in console
- Verify Tauri API is accessible

### Buttons Not Clickable
- Remove `data-tauri-drag-region` from button containers
- Ensure buttons don't have pointer-events: none

### Window Won't Drag
- Add `data-tauri-drag-region` to title bar
- Check that attribute is on correct elements
- Verify no overlaying elements blocking drag

## Dependencies

- **Tauri 2.x**: Core window management
- **lucide-react**: Icons for React components
- **urlencoding**: URL parameter encoding (Rust)

## Future Enhancements

Potential improvements:
- [ ] Theme switcher in title bar
- [ ] Favorites/bookmarks in navigation
- [ ] Tab system for multiple pages
- [ ] Picture-in-picture mode
- [ ] Developer tools toggle
- [ ] Full-screen mode button

## References

- [Tauri Window Customization](https://tauri.app/v1/guides/features/window-customization)
- [Custom Title Bar Example](https://github.com/tauri-apps/tauri/tree/dev/examples/api/src-tauri)
- [Windows Native Styling Guidelines](https://docs.microsoft.com/en-us/windows/apps/design/basics/)
