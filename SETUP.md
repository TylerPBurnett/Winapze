# Custom Title Bar - Quick Setup Guide

## ✅ What's Been Implemented

Your WebCatalog clone now has fully functional custom title bars:

### Main Catalog Window
- ✅ Custom title bar with window controls (minimize, maximize, close)
- ✅ Draggable area
- ✅ Theme-aware styling

### App Windows  
- ✅ Custom title bar with navigation (back, forward, refresh, home)
- ✅ App name displayed in center
- ✅ Window controls on the right
- ✅ Loads external URLs in iframe with custom chrome

## 📁 Files Created/Modified

### New Files
1. `app-window.html` - Standalone HTML wrapper for app windows
2. `src/components/AppWindowTitleBar.tsx` - React component (reference only)
3. `CUSTOM_TITLEBAR.md` - Detailed documentation
4. `SETUP.md` - This file

### Modified Files
1. `src-tauri/src/lib.rs` - Updated to create windows without decorations
2. `src-tauri/Cargo.toml` - Added `urlencoding` dependency
3. `src/App.css` - Added title bar styles

## 🚀 Testing the Implementation

### 1. Install Dependencies

```powershell
# Install Rust dependency
cd src-tauri
cargo build

# Or just run the app, it will install automatically
```

### 2. Run the App

```powershell
# From project root
bun run tauri dev
```

### 3. Test Main Catalog Window

The main catalog already has the custom title bar:
- Try dragging the window by the title bar
- Test minimize, maximize, and close buttons
- Toggle between light/dark/dim themes

### 4. Test App Windows

1. Click on any app card (e.g., Google, YouTube, ChatGPT)
2. A new window should open with:
   - Custom title bar at the top
   - Navigation buttons on the left
   - App name in center
   - Window controls on the right
3. Test the navigation:
   - Click links in the app
   - Use the Back button
   - Use the Forward button
   - Click Refresh
   - Click Home to return to original URL
4. Test window controls:
   - Minimize
   - Maximize/Restore
   - Close

## ⚠️ Known Limitations

### Iframe Restrictions
Some websites may not load in iframes due to security policies (X-Frame-Options). This is a browser security feature, not a bug. Examples:
- Google services (sometimes blocked)
- Banking websites
- Some social media sites

**Workaround**: These sites will need to be opened in a native webview (future enhancement) or external browser.

### Cross-Origin Navigation
Navigation buttons may not work properly on some cross-origin iframes due to browser security. This is expected behavior.

## 🎨 Customization

### Change Title Bar Colors

Edit CSS variables in `app-window.html`:

```css
:root {
  --sidebar: #ffffff;           /* Background color */
  --sidebar-border: #e2e8f0;    /* Border color */
  --text-primary: #0f172a;      /* Text color */
  --text-secondary: #64748b;    /* Icon color */
}
```

### Change Button Layout

Modify the HTML structure in `app-window.html` and corresponding CSS classes.

### Add Theme Support

The app-window.html currently uses light theme only. To add dark theme:

1. Add theme detection/toggle
2. Update CSS variables dynamically
3. Sync with main window theme preference

## 🐛 Troubleshooting

### Window Opens but Title Bar Missing
**Solution**: Check that `app-window.html` is in the project root and accessible by Tauri.

### Navigation Buttons Don't Work
**Solution**: Check browser console for CORS errors. This is expected for some sites due to iframe restrictions.

### Can't Drag Window
**Solution**: Ensure `data-tauri-drag-region` attribute is on the title bar and not blocked by other elements.

### Title Bar Looks Wrong
**Solution**: Clear Tauri cache and rebuild:
```powershell
bun run tauri dev --clean
```

## 📝 Next Steps

### Recommended Enhancements

1. **Theme Synchronization**
   - Sync app window themes with main catalog
   - Pass theme as URL parameter
   - Apply theme CSS dynamically

2. **Better URL Handling**
   - Use native webview instead of iframe for better compatibility
   - Implement multi-window webview system
   - Handle X-Frame-Options gracefully

3. **Enhanced Navigation**
   - Add URL bar
   - Show loading indicators
   - Add favorites/bookmarks
   - Implement find in page

4. **Settings**
   - Configurable title bar height
   - Custom button layouts
   - Per-app window preferences

## 📖 Full Documentation

See `CUSTOM_TITLEBAR.md` for comprehensive documentation including:
- Architecture details
- Customization guide
- API reference
- Advanced usage

## 💡 Tips

- Use the React DevTools in the main catalog window to inspect components
- Check the Tauri DevTools for debugging app windows
- Test in different screen sizes and DPI settings
- Try maximizing to ensure snap layouts work correctly on Windows 11

## 🤝 Support

If you encounter issues:
1. Check the browser console for errors
2. Review `CUSTOM_TITLEBAR.md` for detailed troubleshooting
3. Verify all files are in the correct locations
4. Ensure dependencies are installed correctly

---

**You're all set!** Your custom title bar implementation is complete and ready to use. 🎉
