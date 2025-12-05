# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**Winapps** (Web Catalog) is a lightweight, fast, and beautiful desktop application that allows users to run websites as standalone, windowed applications. Built with Tauri (Rust backend) and React (TypeScript frontend), it provides a catalog management interface where users can add, edit, delete, and launch web apps in isolated windows.

## Common Commands

### Development
- `bun run dev` - Start development server (Vite on port 1420)
- `bun run build` - Build frontend with TypeScript compilation and Vite bundling
- `bun run tauri` - Run Tauri CLI commands
- `bun run tauri dev` - Launch the app in development mode with hot reload

### Building & Deployment
- `bun run tauri build` - Build the production desktop application
- `bun run preview` - Preview the production build locally

### Type Checking
- Run `tsc` (via `bun run build`) to type-check TypeScript before building

## Architecture Overview

### High-Level Architecture

The application follows a **frontend-backend split** pattern:

```
Frontend (React + TypeScript)          Backend (Rust + Tauri)
├── App.tsx (main component)           ├── lib.rs (core logic)
├── Components/                        ├── Window Management
│   ├── AppCard                        ├── File Persistence
│   ├── AppModal                       └── Profile Isolation
│   └── ContextMenu
└── Theme System (CSS Variables)
```

**Data Flow:**
1. User interacts with React UI (Add/Edit/Delete/Launch)
2. React state updates locally and persists via Rust backend
3. Rust backend handles file I/O and app window spawning
4. Each launched app gets its own isolated WebView2 context

### Frontend (`src/`)

**App.tsx** - Main component managing:
- App catalog state (list of installed apps)
- Theme management (light/dark/dim modes)
- Modal dialogs for adding and editing apps
- Context menus for app actions
- Integration with Rust backend via `@tauri-apps/api/core` invoke()

**Data Model:**
```typescript
interface AppItem {
  id: number;
  name: string;
  url: string;
  icon: string; // Either favicon URL or single character fallback
}
```

**Components:**
- **AppCard.tsx** - Renders individual app icons/cards with hover and context menu support
- **AppModal.tsx** - Modal dialog for adding/editing apps (form with name, URL, optional icon)
- **ContextMenu.tsx** - Right-click menu with Edit and Delete options

**Styling (App.css):**
- CSS custom properties define three themes: light, dark, and dim
- Tailwind CSS v4 with @theme syntax for dynamic theme switching
- Search bar colors per rule: dim (#2D2E3A), dark (#242424), light (#F8F8FA)
- The `data-theme` attribute on document root controls active theme

### Backend (`src-tauri/src/lib.rs`)

**Core Tauri Commands** (invoked from React):

1. **`load_apps`** - Reads `apps.json` from AppData; returns empty array if file doesn't exist
2. **`save_apps`** - Persists app list to `apps.json` in AppData
3. **`open_app_window`** - Creates isolated WebView window:
   - Spawns new Tauri WebviewWindow pointing to external URL
   - Creates unique `data_directory` under `profiles/{app_id}` for WebView2 storage isolation
   - Sets window title to app name
   - Default window size: 1200x800

**Storage Structure:**
- **apps.json** - Located in `%APPDATA%/web-catalog/` (Tauri's app_data_dir)
- **profiles/** - Subdirectory containing isolated data directories per app
  - `profiles/app-{id}/` - WebView2 stores cookies, local storage, etc. per app

**Key Design Decisions:**
- Each app has its own `data_directory` to prevent cookie/storage leakage between windows
- Profile isolation ensures strict separation of web storage (CSS, local storage, cookies)
- Main dashboard remains independent; closing it doesn't close app windows

## Key Development Patterns

### State Management
- React state (`useState`) for UI state (apps list, modals, context menu, theme)
- Rust backend for persistent storage and window management
- No external state management library (Redux, Zustand); keep it simple

### URL Handling
- Automatically prefix URLs with `https://` if missing
- Favicon auto-fetching via Google's favicon service: `https://www.google.com/s2/favicons?domain={domain}&sz=128`
- Fallback to first character of app name if favicon fetch fails

### Theme System
- Set `data-theme` attribute on `document.documentElement` to switch themes
- Cycle through: light → dark → dim → light (via toggle button)
- CSS variables update based on `[data-theme]` selector

### Modal Pattern
- Single `AppModal` component used for both add and edit flows
- Controlled by `isOpen`, `onClose`, `onSave` props
- Pass `initialData` for edit mode; leave undefined for add mode

## Roadmap Alignment

**Phase 1: Core Polish** (In Progress)
- [x] Dynamic window titles
- [x] CRUD actions (Add, Delete, Edit)
- [x] Favicon fetching
- [ ] Search bar functionality

**Phase 2: Customization & UX** (Planned)
- Manual icon uploads
- Window state persistence
- Theming enhancements
- Context menu refinements

**Phase 3: Advanced Features** (Future)
- Cookie/storage isolation per profile
- Tray support
- Auto-start functionality
- Global keyboard shortcuts

## Security & Permissions

- Tauri CSP and permissions need review before production
- Currently using default permissions; tighten as features grow
- WebView2 isolation per app prevents cross-site cookie leakage

## Common Development Tasks

### Adding a New App Property
1. Update `AppItem` interface in both `App.tsx` and `lib.rs`
2. Add field to `AppModal` form
3. Update persistence in `save_apps` and `load_apps`
4. Update `AppCard` display if needed

### Styling Components
- Use Tailwind classes combined with CSS custom property variables (e.g., `bg-primary`, `text-text-secondary`)
- For theme-specific colors, reference CSS variables in `App.css`
- Transitions use `transition-colors duration-300` for smooth theme switching

### Debugging Tauri Commands
- Use `console.log()` in React and `println!()` in Rust
- Browser DevTools accessible via right-click > Inspect (in dev mode)
- Check AppData folders for persisted `apps.json`
