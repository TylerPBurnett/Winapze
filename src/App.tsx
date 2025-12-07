import { useState, useEffect, useMemo } from "react";
import Fuse from "fuse.js";
import { invoke } from "@tauri-apps/api/core";
import { Search, Plus, Settings, Moon, Sun, Monitor, Home } from "lucide-react";
import { Input } from "./components/ui/input";
import "./App.css";
import AppCard from "./components/AppCard";
import AppModal from "./components/AppModal";
import ContextMenu from "./components/ContextMenu";
import SidebarItem from "./components/SidebarItem";
import CustomTitleBar from "./components/CustomTitleBar";

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
    console.log("[App] Initializing main dashboard window");
    
    invoke<AppItem[]>("load_apps")
      .then((loadedApps) => {
        console.log("[App] Loaded apps:", loadedApps?.length || 0, "apps");
        if (loadedApps && loadedApps.length > 0) {
          setApps(loadedApps);
        }
      })
      .catch((err) => {
        console.error("[App] Error loading apps:", err);
      });

    // Set initial theme
    document.documentElement.setAttribute('data-theme', theme);
    console.log("[App] Theme set to:", theme);
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
    <div className="flex flex-col h-screen font-sans selection:bg-primary/30 relative transition-colors duration-300 bg-background text-text-primary">
      {/* Custom title bar for main dashboard window */}
      <CustomTitleBar />
      
      {/* Main content area below title bar */}
      <div className="flex flex-1 min-h-0">
      {/* Sidebar */}
      <aside className="w-24 flex flex-col items-center py-8 backdrop-blur-xl border-r transition-colors duration-300 bg-sidebar/50 border-sidebar-border z-20">
        <div className="mb-10">
          <SidebarItem
            icon={Home}
            label="Home"
            variant="primary"
            isActive={true}
          />
        </div>

        <nav className="flex-1 flex flex-col gap-6 w-full items-center">
          <SidebarItem
            icon={theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor}
            label={`Current Theme: ${theme}`}
            onClick={toggleTheme}
          />

          <SidebarItem
            icon={Plus}
            label="Add App"
            onClick={() => setIsAddModalOpen(true)}
          />
        </nav>

        <div className="mt-auto">
          <SidebarItem
            icon={Settings}
            label="Settings"
          />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto" onClick={closeContextMenu}>
        <header className="h-20 grid grid-cols-3 items-center px-8 sticky top-0 backdrop-blur-md z-10 bg-background/80">
          <div className="flex items-center">
            {/* Left side - Reserved for future title/logo */}
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
    </div>
  );
}

export default App;
