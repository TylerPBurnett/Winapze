use std::fs;
use tauri::{
    menu::{MenuBuilder, MenuItemBuilder, PredefinedMenuItem},
    Manager,
};
use url::Url;

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
struct AppItem {
    id: u64,
    name: String,
    url: String,
    icon: String,
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn open_app_window(
    app: tauri::AppHandle,
    url: String,
    label: String,
    name: String,
) -> Result<(), String> {
    println!("[open_app_window] Opening window: {} ({}) with url: {}", label, name, url);
    let url_parsed = Url::parse(&url).map_err(|e| e.to_string())?;
    let home_url = url.clone();

    // Calculate data directory for this app profile to ensure isolation
    let app_data_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let profile_path = app_data_dir.join("profiles").join(&label);
    println!("[open_app_window] Profile path: {:?}", profile_path);

    // Ensure directory exists
    if !profile_path.exists() {
        fs::create_dir_all(&profile_path).map_err(|e| e.to_string())?;
        println!("[open_app_window] Created profile directory");
    }

    // Create menu items for navigation with icon-only labels (no accelerator display for cleaner look)
    let back_item = MenuItemBuilder::with_id("nav_back", "←")
        .build(&app)
        .map_err(|e| e.to_string())?;
    
    let forward_item = MenuItemBuilder::with_id("nav_forward", "→")
        .build(&app)
        .map_err(|e| e.to_string())?;
    
    // Separator between navigation and actions
    let separator1 = PredefinedMenuItem::separator(&app)
        .map_err(|e| e.to_string())?;
    
    let reload_item = MenuItemBuilder::with_id("nav_reload", "⟳")
        .build(&app)
        .map_err(|e| e.to_string())?;
    
    let home_item = MenuItemBuilder::with_id("nav_home", "⌂")
        .build(&app)
        .map_err(|e| e.to_string())?;

    // Build the menu with navigation items and separators
    let menu = MenuBuilder::new(&app)
        .item(&back_item)
        .item(&forward_item)
        .item(&separator1)
        .item(&reload_item)
        .item(&home_item)
        .build()
        .map_err(|e| e.to_string())?;

    println!("[open_app_window] Menu created successfully");

    // Build the window with native decorations and menu
    let window = tauri::WebviewWindowBuilder::new(&app, &label, tauri::WebviewUrl::External(url_parsed))
        .title(&name)
        .inner_size(1200.0, 800.0)
        .data_directory(profile_path)
        .menu(menu)
        .build()
        .map_err(|e| e.to_string())?;

    println!("[open_app_window] Window built successfully");

    // Set up menu event handler
    let window_clone = window.clone();
    let home_url_clone = home_url.clone();
    
    window.on_menu_event(move |_win, event| {
        println!("[Menu Event] Received: {:?}", event.id().0);
        
        let webview = &window_clone;
        
        match event.id().0.as_str() {
            "nav_back" => {
                println!("[Menu] Back navigation triggered");
                if let Err(e) = webview.eval("window.history.back()") {
                    eprintln!("[Menu] Error executing back: {}", e);
                }
            }
            "nav_forward" => {
                println!("[Menu] Forward navigation triggered");
                if let Err(e) = webview.eval("window.history.forward()") {
                    eprintln!("[Menu] Error executing forward: {}", e);
                }
            }
            "nav_reload" => {
                println!("[Menu] Reload triggered");
                if let Err(e) = webview.eval("window.location.reload()") {
                    eprintln!("[Menu] Error executing reload: {}", e);
                }
            }
            "nav_home" => {
                println!("[Menu] Home navigation triggered to: {}", home_url_clone);
                let js = format!("window.location.href = '{}'", home_url_clone);
                if let Err(e) = webview.eval(&js) {
                    eprintln!("[Menu] Error executing home: {}", e);
                }
            }
            _ => {
                println!("[Menu] Unknown menu event: {}", event.id().0);
            }
        }
    });

    println!("[open_app_window] Menu event handler registered");
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
        .invoke_handler(tauri::generate_handler![
            greet,
            open_app_window,
            save_apps,
            load_apps
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
