use std::fs;
use tauri::Manager;
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
    println!("Opening window: {} ({}) with url: {}", label, name, url);
    let url_parsed = Url::parse(&url).map_err(|e| e.to_string())?;

    // Calculate data directory for this app profile to ensure isolation
    let app_data_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let profile_path = app_data_dir.join("profiles").join(&label);

    // Ensure directory exists
    if !profile_path.exists() {
        fs::create_dir_all(&profile_path).map_err(|e| e.to_string())?;
    }

    tauri::WebviewWindowBuilder::new(&app, &label, tauri::WebviewUrl::External(url_parsed))
        .title(&name)
        .inner_size(1200.0, 800.0)
        .data_directory(profile_path)
        .build()
        .map_err(|e| e.to_string())?;

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
