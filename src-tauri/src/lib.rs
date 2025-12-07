use std::fs;
use std::process::Command;
use tauri::{webview::WebviewBuilder, window::WindowBuilder, AppHandle, Manager, WebviewUrl};
use url::Url;

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
struct AppItem {
    id: u64,
    name: String,
    url: String,
    icon: String,
}

#[derive(Clone, serde::Serialize)]
struct WebviewState {
    url: String,
    can_go_back: bool,
    can_go_forward: bool,
    loading: bool,
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

// Navigation Commands
#[tauri::command]
fn nav_back(window: tauri::Window) -> Result<(), String> {
    if let Some(webview) = window.get_webview("content") {
        webview
            .eval("window.history.back()")
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
fn nav_forward(window: tauri::Window) -> Result<(), String> {
    if let Some(webview) = window.get_webview("content") {
        webview
            .eval("window.history.forward()")
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
fn nav_reload(window: tauri::Window) -> Result<(), String> {
    if let Some(webview) = window.get_webview("content") {
        webview.reload().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
fn nav_home(window: tauri::Window) -> Result<(), String> {
    Ok(())
}

fn create_app_window(
    app: &AppHandle,
    url: String,
    label_prefix: String,
    name: String,
) -> Result<(), String> {
    let window_label = format!("win-{}", label_prefix);

    let url_parsed = Url::parse(&url).map_err(|e| e.to_string())?;

    // Data directory
    let app_data_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let profile_path = app_data_dir.join("profiles").join(&label_prefix);
    if !profile_path.exists() {
        fs::create_dir_all(&profile_path).map_err(|e| e.to_string())?;
    }

    // 1. Create the Host Window
    let window = WindowBuilder::new(app, &window_label)
        .title(&name)
        .inner_size(1200.0, 800.0)
        .decorations(false)
        .build()
        .map_err(|e| e.to_string())?;

    // 2. Create Toolbar Webview (Top 50px)
    let toolbar_url = WebviewUrl::App(
        format!(
            "index.html?mode=toolbar&url={}&name={}",
            urlencoding::encode(&url),
            urlencoding::encode(&name)
        )
        .into(),
    );

    let toolbar_builder = WebviewBuilder::new("toolbar", toolbar_url);
    let toolbar_webview = window
        .add_child(
            toolbar_builder,
            tauri::Position::Logical(tauri::LogicalPosition { x: 0.0, y: 0.0 }),
            tauri::Size::Logical(tauri::LogicalSize {
                width: 1200.0,
                height: 50.0,
            }),
        )
        .map_err(|e| e.to_string())?;

    // 3. Create Content Webview (Below toolbar)
    let content_builder = WebviewBuilder::new("content", WebviewUrl::External(url_parsed));
    let content_webview = window
        .add_child(
            content_builder,
            tauri::Position::Logical(tauri::LogicalPosition { x: 0.0, y: 50.0 }),
            tauri::Size::Logical(tauri::LogicalSize {
                width: 1200.0,
                height: 750.0,
            }),
        )
        .map_err(|e| e.to_string())?;

    // 4. Setup Resize Handler
    let window_clone = window.clone();
    window.on_window_event(move |event| {
        if let tauri::WindowEvent::Resized(size) = event {
            let width = size.width;
            let height = size.height;
            let toolbar_height = 50;

            if let Some(toolbar) = window_clone.get_webview("toolbar") {
                let _ = toolbar.set_bounds(tauri::Rect {
                    position: tauri::Position::Physical(tauri::PhysicalPosition { x: 0, y: 0 }),
                    size: tauri::Size::Physical(tauri::PhysicalSize {
                        width,
                        height: toolbar_height,
                    }),
                });
            }

            if let Some(content) = window_clone.get_webview("content") {
                let _ = content.set_bounds(tauri::Rect {
                    position: tauri::Position::Physical(tauri::PhysicalPosition {
                        x: 0,
                        y: toolbar_height as i32,
                    }),
                    size: tauri::Size::Physical(tauri::PhysicalSize {
                        width,
                        height: height - toolbar_height,
                    }),
                });
            }
        }
    });

    Ok(())
}

#[tauri::command]
async fn open_app_window(
    app: tauri::AppHandle,
    url: String,
    label: String,
    name: String,
) -> Result<(), String> {
    create_app_window(&app, url, label, name)
}

#[tauri::command]
async fn create_desktop_shortcut(
    app: tauri::AppHandle,
    _app_id: u64,
    name: String,
    url: String,
) -> Result<(), String> {
    let current_exe = std::env::current_exe().map_err(|e| e.to_string())?;
    let exe_path = current_exe.to_str().ok_or("Invalid exe path")?;
    let safe_name = name.replace("\"", "");
    let safe_url = url.replace("\"", "");

    let ps_script = format!(
        "$ws = New-Object -ComObject WScript.Shell; \
        $desktop = [Environment]::GetFolderPath('Desktop'); \
        $s = $ws.CreateShortcut(\"$desktop\\{}.lnk\"); \
        $s.TargetPath = '{}'; \
        $s.Arguments = '--app-url \"{}\" --app-name \"{}\"'; \
        $s.Save()",
        safe_name, exe_path, safe_url, safe_name
    );

    let output = Command::new("powershell")
        .args(["-NoProfile", "-Command", &ps_script])
        .output()
        .map_err(|e| e.to_string())?;

    if !output.status.success() {
        return Err(format!(
            "Powershell error: {}",
            String::from_utf8_lossy(&output.stderr)
        ));
    }
    Ok(())
}

#[tauri::command]
fn save_apps(app: tauri::AppHandle, apps: Vec<AppItem>) -> Result<(), String> {
    let path = app.path().app_data_dir().map_err(|e| e.to_string())?;
    if !path.exists() {
        fs::create_dir_all(&path).map_err(|e| e.to_string())?;
    }
    let file_path = path.join("apps.json");
    let json = serde_json::to_string(&apps).map_err(|e| e.to_string())?;
    fs::write(file_path, json).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn load_apps(app: tauri::AppHandle) -> Result<Vec<AppItem>, String> {
    let path = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let file_path = path.join("apps.json");
    if !file_path.exists() {
        return Ok(vec![]);
    }
    let data = fs::read_to_string(file_path).map_err(|e| e.to_string())?;
    let apps: Vec<AppItem> = serde_json::from_str(&data).map_err(|e| e.to_string())?;
    Ok(apps)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let args: Vec<String> = std::env::args().collect();
            let mut app_url = None;
            let mut app_name = None;

            let mut i = 0;
            while i < args.len() {
                if args[i] == "--app-url" && i + 1 < args.len() {
                    app_url = Some(args[i + 1].clone());
                } else if args[i] == "--app-name" && i + 1 < args.len() {
                    app_name = Some(args[i + 1].clone());
                }
                i += 1;
            }

            if let (Some(url), Some(name)) = (app_url, app_name) {
                let handle = app.handle();
                let label = format!(
                    "app-{}",
                    std::time::SystemTime::now()
                        .duration_since(std::time::UNIX_EPOCH)
                        .unwrap()
                        .as_millis()
                );
                create_app_window(handle, url, label, name).expect("Failed to create app window");
            } else {
                let main_window = app.get_webview_window("main").unwrap();
                main_window.show().unwrap();
                main_window.set_focus().unwrap();
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            open_app_window,
            save_apps,
            load_apps,
            create_desktop_shortcut,
            nav_back,
            nav_forward,
            nav_reload,
            nav_home
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
