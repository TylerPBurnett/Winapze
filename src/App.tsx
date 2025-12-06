import { useState, useEffect, useMemo } from "react";
import Fuse from "fuse.js";
import { invoke } from "@tauri-apps/api/core";
import { Search, Plus, Grid, Settings, Moon, Sun, Monitor } from "lucide-react";
import { Input } from "./components/ui/input";
import "./App.css";
import AppCard from "./components/AppCard";
import AppModal from "./components/AppModal";
import ContextMenu from "./components/ContextMenu";

interface AppItem {
  id: number;
  name: string;
  url: string;
  icon: string;
}

type Theme = 'light' | 'dark' | 'dim';

function App() {
  const [apps, setApps] = useState<AppItem[]>([
    { id: 1, name: "Google", url: "https://google.com", icon: "https://www.google.com/s2/favicons?domain=google.com&sz=128" },
    { id: 2, name: "YouTube", url: "https://youtube.com", icon: "https://www.google.com/s2/favicons?domain=youtube.com&sz=128" },
    { id: 3, name: "ChatGPT", url: "https://chat.openai.com", icon: "https://www.google.com/s2/favicons?domain=openai.com&sz=128" },
  ]);

  const [theme, setTheme] = useState<Theme>('dark');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<AppItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; appId: number | null }>({
    x: 0,
    y: 0,
    appId: null,
  });

  useEffect(() => {
    invoke<AppItem[]>("load_apps")
      .then((loadedApps) => {
        if (loadedApps && loadedApps.length > 0) {
          setApps(loadedApps);
        }
      })
      .catch(console.error);

    // Set initial theme
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]); // Re-run when theme changes

  const handleAddApp = async (name: string, url: string, icon: string) => {
    const formattedUrl = url.startsWith("http") ? url : `https://${url}`;
    let finalIcon = icon;

    if (!finalIcon) {
      try {
        const domain = new URL(formattedUrl).hostname;
        finalIcon = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
      } catch (e) {
        console.error("Invalid URL for icon fetch", e);
        finalIcon = name.charAt(0).toUpperCase();
      }
    }

    const newApp: AppItem = {
      id: Date.now(),
      name,
      url: formattedUrl,
      icon: finalIcon,
    };

    const updatedApps = [...apps, newApp];
    setApps(updatedApps);
    await invoke("save_apps", { apps: updatedApps });
  };

  const handleEditAppSave = async (name: string, url: string, icon: string) => {
    if (!editingApp) return;

    const formattedUrl = url.startsWith("http") ? url : `https://${url}`;
    let finalIcon = icon;
    if (!finalIcon) {
      try {
        const domain = new URL(formattedUrl).hostname;
        finalIcon = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
      } catch (e) {
        finalIcon = name.charAt(0).toUpperCase();
      }
    }

    const updatedApps = apps.map(app =>
      app.id === editingApp.id
        ? { ...app, name, url: formattedUrl, icon: finalIcon }
        : app
    );

    setApps(updatedApps);
    await invoke("save_apps", { apps: updatedApps });
    setEditingApp(null);
  };

  const deleteApp = async (e: React.MouseEvent | null, id: number) => {
    e?.stopPropagation();
    const updatedApps = apps.filter((app) => app.id !== id);
    setApps(updatedApps);
    await invoke("save_apps", { apps: updatedApps });
  };

  const openApp = async (app: AppItem) => {
    await invoke("open_app_window", {
      url: app.url,
      label: `app-${app.id}`,
      name: app.name
    });
  };

  const handleContextMenu = (e: React.MouseEvent, app: AppItem) => {
    e.preventDefault();
    setContextMenu({ x: e.pageX, y: e.pageY, appId: app.id });
  };

  const closeContextMenu = () => {
    setContextMenu({ x: 0, y: 0, appId: null });
  };

  const onEditFromContextMenu = () => {
    const appToEdit = apps.find(a => a.id === contextMenu.appId);
    if (appToEdit) {
      setEditingApp(appToEdit);
      setIsEditModalOpen(true);
    }
  };

  const onDeleteFromContextMenu = () => {
    if (contextMenu.appId) {
      deleteApp(null, contextMenu.appId);
    }
  };

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : prev === 'dark' ? 'dim' : 'light';
      return next;
    });
  };

  const filteredApps = useMemo(() => {
    if (!searchQuery) return apps;

    const fuse = new Fuse(apps, {
      keys: ["name", "url"],
      threshold: 0.3, // 0.0 = perfect match, 1.0 = match anything
    });

    return fuse.search(searchQuery).map((result) => result.item);
  }, [apps, searchQuery]);

  return (
    <div className="flex h-screen font-sans selection:bg-primary/30 relative transition-colors duration-300 bg-background text-text-primary">
      {/* Sidebar */}
      <aside className="w-20 flex flex-col items-center py-6 backdrop-blur-xl border-r transition-colors duration-300 bg-sidebar border-sidebar-border">
        <div className="mb-8 p-3 bg-primary rounded-xl shadow-lg shadow-primary/20">
          <Grid size={24} className="text-primary-text" />
        </div>

        <nav className="flex-1 flex flex-col gap-4 w-full px-2">
          <button
            onClick={toggleTheme}
            className="p-3 rounded-xl transition-colors group relative hover:bg-surface-hover"
            title={`Current Theme: ${theme}`}
          >
            {theme === 'light' && <Sun size={22} className="text-text-secondary group-hover:text-primary transition-colors" />}
            {theme === 'dark' && <Moon size={22} className="text-text-secondary group-hover:text-primary transition-colors" />}
            {theme === 'dim' && <Monitor size={22} className="text-text-secondary group-hover:text-primary transition-colors" />}
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="p-3 rounded-xl transition-colors group hover:bg-surface-hover"
          >
            <Plus size={22} className="text-text-secondary group-hover:text-primary transition-colors" />
          </button>
        </nav>

        <button className="p-3 rounded-xl transition-colors hover:bg-surface-hover">
          <Settings size={22} className="text-text-secondary hover:text-primary transition-colors" />
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto" onClick={closeContextMenu}>
        <header className="h-20 grid grid-cols-3 items-center px-8 sticky top-0 backdrop-blur-md z-10 bg-background/80">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              Library
            </h1>
          </div>

          <div className="flex justify-center w-full">
            <div className="relative group w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors" size={18} />
              <Input
                type="text"
                placeholder="Search apps..."
                className="pl-10 h-10 w-full rounded-2xl bg-surface/50 border-input-border focus-visible:ring-primary/50 focus-visible:border-primary/50 transition-all font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end">
            {/* Empty for now, balances grid */}
          </div>
        </header>

        <div className="p-8 w-fit mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-16">
          {filteredApps.map((app) => (
            <AppCard
              key={app.id}
              app={app}
              onClick={openApp}
              onDelete={deleteApp}
              onContextMenu={handleContextMenu}
            />
          ))}

          {/* Add New Card */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="group flex flex-col items-center gap-3 p-2 rounded-xl transition-all duration-300"
          >
            <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-text-secondary/30 flex items-center justify-center transition-colors group-hover:border-primary/50 bg-surface/50">
              <Plus size={28} className="text-text-secondary group-hover:text-primary transition-colors" />
            </div>
            <span className="text-sm font-medium text-text-secondary group-hover:text-primary transition-colors">Add</span>
          </button>
        </div>
      </main>

      {/* Context Menu */}
      {contextMenu.appId && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={closeContextMenu}
          onEdit={onEditFromContextMenu}
          onDelete={onDeleteFromContextMenu}
        />
      )}

      {/* Modals */}
      <AppModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddApp}
        title="Add New App"
        submitLabel="Add App"
      />

      <AppModal
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setEditingApp(null); }}
        onSave={handleEditAppSave}
        initialData={editingApp ? { name: editingApp.name, url: editingApp.url, icon: editingApp.icon } : undefined}
        title="Edit App"
        submitLabel="Save Changes"
      />
    </div>
  );
}

export default App;
