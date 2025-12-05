# Web Catalog - Project Context & Roadmap

## Project Goal
Create a lightweight, fast, secure, and beautiful alternative to "WebCatalog" for Windows.
**Core Value:** Run websites as standalone, windowed applications to separate them from the main browser workflow.

## Tech Stack
*   **Core:** Tauri v2 (Rust)
*   **Frontend:** React v19 (TypeScript)
*   **Build Tool:** Vite
*   **Styling:** Tailwind CSS v4
*   **Icons:** Lucide React

## Current State (as of Dec 5, 2025)
*   **UI:** Modern, dark-themed dashboard with a sidebar, search bar (visual only), and app grid.
*   **Backend (Rust):**
    *   `save_apps` / `load_apps`: Persists app list to `apps.json` in the user's app data directory.
    *   `open_app_window`: Spawns a new Tauri window pointing to the target URL.
*   **Features:**
    *   Add new apps (Name + URL).
    *   Launch apps in separate windows.
    *   Basic persistence.

## Roadmap

### Phase 1: Core Polish (Current Focus)
- [ ] **Dynamic Window Titles:** Ensure opened windows show the app name, not just "Frame App".
- [ ] **CRUD Actions:** Add ability to Edit and Delete apps from the dashboard.
- [ ] **Favicon Fetching:** Automatically fetch high-quality icons/favicons from the provided URL instead of using the first letter.
- [ ] **Search:** Make the search bar functional to filter the app list.

### Phase 2: Customization & UX
- [ ] **Custom Icons:** Allow users to upload images or paste image URLs for app icons.
- [ ] **Window State:** Remember the size and position of each specific app window.
- [ ] **Theming:** Allow simple color accents or background customization.
- [ ] **Context Menu:** Right-click on apps for options (Edit, Delete, Open in Browser).

### Phase 3: Advanced Features
- [ ] **Isolation:** Investigate cookie/storage isolation per app (Profiles).
- [ ] **Tray Support:** Option to minimize apps to the system tray.
- [ ] **Auto-start:** Configuration to launch specific apps on startup.
- [ ] **Keyboard Shortcuts:** Global hotkeys to launch specific apps.

## Developer Notes
*   **State Management:** Currently local React state + Rust backend sync.
*   **Persistence:** `apps.json` in `AppData`.
*   **Security:** Currently using default Tauri permissions. Need to ensure `csp` and permissions are tightened as features grow.

## User Preferences
*   **Icons:** Auto-fetch favicon/logo first, but allow manual upload/override by the user.
*   **Isolation:** **STRICT ISOLATION**. Each app must have its own storage (cookies, local storage) so logins do not leak between apps.
*   **Window Behavior:** Independent windows. Closing the main "Catalog" window must NOT close the open app windows. The Catalog is just for management.

## Roadmap

### Phase 1: Core Architecture (Isolation & Window Management)
- [x] **Data Isolation:** Modify `open_app_window` to assign a unique `data_directory` for each app (e.g., inside `AppData/profiles/{app_id}`).
- [x] **Window Persistence:** Ensure the main process keeps running or windows survive when the main dashboard is closed.
- [x] **Dynamic Window Titles:** Ensure opened windows show the app name.

### Phase 2: Core Features (Icons & CRUD)
- [x] **Favicon Auto-Fetch:** Implement logic (Rust or Frontend) to fetch high-res icons from URLs.
- [x] **App Deletion:** Added delete button and logic.
- [ ] **Manual Icon Upload:** Add UI/Backend to select a local image, copy it to `AppData/icons`, and use it. (Currently supports Icon URLs)
- [ ] **Edit App:** Allow editing existing apps.

### Phase 3: Polish & Customization
- [ ] **Search:** Functional search bar.
- [ ] **Window State:** Remember size/position per app.
- [ ] **Theming:** Simple accents.
- [ ] **Tray Support:** Minimize to tray.

## Developer Notes
*   **State Management:** Currently local React state + Rust backend sync.
*   **Persistence:** `apps.json` in `AppData`.
*   **Security:** `csp` and permissions need review.
*   **Isolation Strategy:** Use Tauri's `data_directory` on `WebviewWindowBuilder` to separate WebView2 contexts.
