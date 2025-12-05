import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Search, Plus, Grid, Settings, Globe, X, Trash2 } from "lucide-react";
import "./App.css";

interface AppItem {
  id: number;
  name: string;
  url: string;
  icon: string;
}

function App() {
  const [apps, setApps] = useState<AppItem[]>([
    { id: 1, name: "Google", url: "https://google.com", icon: "https://www.google.com/s2/favicons?domain=google.com&sz=128" },
    { id: 2, name: "YouTube", url: "https://youtube.com", icon: "https://www.google.com/s2/favicons?domain=youtube.com&sz=128" },
    { id: 3, name: "ChatGPT", url: "https://chat.openai.com", icon: "https://www.google.com/s2/favicons?domain=openai.com&sz=128" },
  ]);

  useEffect(() => {
    invoke<AppItem[]>("load_apps")
      .then((loadedApps) => {
        if (loadedApps && loadedApps.length > 0) {
          setApps(loadedApps);
        }
      })
      .catch(console.error);
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAppName, setNewAppName] = useState("");
  const [newAppUrl, setNewAppUrl] = useState("");
  const [newAppIcon, setNewAppIcon] = useState("");

  const handleAddApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppName || !newAppUrl) return;

    const formattedUrl = newAppUrl.startsWith("http") ? newAppUrl : `https://${newAppUrl}`;
    let icon = newAppIcon;

    if (!icon) {
      try {
          const domain = new URL(formattedUrl).hostname;
          icon = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
      } catch (e) {
          console.error("Invalid URL for icon fetch", e);
          icon = newAppName.charAt(0).toUpperCase();
      }
    }

    const newApp: AppItem = {
      id: Date.now(),
      name: newAppName,
      url: formattedUrl,
      icon: icon,
    };

    const updatedApps = [...apps, newApp];
    setApps(updatedApps);
    await invoke("save_apps", { apps: updatedApps });

    setNewAppName("");
    setNewAppUrl("");
    setNewAppIcon("");
    setIsModalOpen(false);
  };

  const deleteApp = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    const updatedApps = apps.filter((app) => app.id !== id);
    setApps(updatedApps);
    await invoke("save_apps", { apps: updatedApps });
  };

  const openApp = async (app: AppItem) => {
    console.log("Opening app:", app);
    await invoke("open_app_window", { 
      url: app.url, 
      label: `app-${app.id}`,
      name: app.name 
    });
  };

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 font-sans selection:bg-indigo-500/30 relative">
      {/* Sidebar */}
      <aside className="w-20 flex flex-col items-center py-6 bg-slate-950/50 border-r border-white/5 backdrop-blur-xl">
        <div className="mb-8 p-3 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
          <Grid size={24} className="text-white" />
        </div>

        <nav className="flex-1 flex flex-col gap-4 w-full px-2">
          <button className="p-3 rounded-xl hover:bg-white/10 transition-colors group relative">
            <Globe size={22} className="text-slate-400 group-hover:text-white transition-colors" />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="p-3 rounded-xl hover:bg-white/10 transition-colors group"
          >
            <Plus size={22} className="text-slate-400 group-hover:text-white transition-colors" />
          </button>
        </nav>

        <button className="p-3 rounded-xl hover:bg-white/10 transition-colors">
          <Settings size={22} className="text-slate-400 hover:text-white transition-colors" />
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-20 flex items-center px-8 justify-between sticky top-0 bg-slate-900/80 backdrop-blur-md z-10">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Library
          </h1>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search apps..."
              className="bg-slate-800/50 border border-white/5 rounded-full pl-10 pr-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-slate-800 transition-all"
            />
          </div>
        </header>

        <div className="p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {apps.map((app) => (
            <div
              key={app.id}
              onClick={() => openApp(app)}
              className="group relative bg-slate-800/40 hover:bg-slate-800/60 border border-white/5 hover:border-indigo-500/30 rounded-2xl p-5 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl font-bold text-white shadow-lg overflow-hidden">
                  {app.icon.startsWith("http") ? (
                    <img src={app.icon} alt={app.name} className="w-full h-full object-cover" />
                  ) : (
                    app.icon
                  )}
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                   <button 
                     onClick={(e) => deleteApp(e, app.id)}
                     className="p-2 hover:bg-red-500/20 hover:text-red-400 rounded-full transition-colors text-slate-400"
                     title="Delete App"
                   >
                    <Trash2 size={16} />
                  </button>
                  <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <Globe size={16} className="text-slate-400" />
                  </button>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">{app.name}</h3>
              <p className="text-sm text-slate-400 truncate">{app.url}</p>
            </div>
          ))}

          {/* Add New Card */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="group border-2 border-dashed border-slate-700 hover:border-indigo-500/50 rounded-2xl p-5 flex flex-col items-center justify-center gap-3 transition-all hover:bg-slate-800/30"
          >
            <div className="w-12 h-12 rounded-full bg-slate-800 group-hover:bg-indigo-500/20 flex items-center justify-center transition-colors">
              <Plus size={24} className="text-slate-400 group-hover:text-indigo-400" />
            </div>
            <span className="font-medium text-slate-400 group-hover:text-indigo-300">Add App</span>
          </button>
        </div>
      </main>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl p-6 transform transition-all scale-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Add New App</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleAddApp} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">App Name</label>
                <input
                  type="text"
                  value={newAppName}
                  onChange={(e) => setNewAppName(e.target.value)}
                  placeholder="e.g. Notion"
                  className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">URL</label>
                <input
                  type="text"
                  value={newAppUrl}
                  onChange={(e) => setNewAppUrl(e.target.value)}
                  placeholder="e.g. notion.so"
                  className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Icon URL (Optional)</label>
                <input
                  type="text"
                  value={newAppIcon}
                  onChange={(e) => setNewAppIcon(e.target.value)}
                  placeholder="https://example.com/icon.png"
                  className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                />
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-300 hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-0.5"
                >
                  Add App
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
