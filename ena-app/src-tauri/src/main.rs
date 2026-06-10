// Prevents an extra console window on Windows in release. Harmless on macOS.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
// Silence a benign lint from the `objc` crate's msg_send! macro on newer rustc.
#![allow(unexpected_cfgs)]

use tauri::{
    CustomMenuItem, GlobalShortcutManager, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu,
    SystemTrayMenuItem,
};

mod engine;

/// Menu-bar tray (orb icon) with Show / Hide / Quit.
fn build_tray() -> SystemTray {
    let menu = SystemTrayMenu::new()
        .add_item(CustomMenuItem::new("show", "Show ENA"))
        .add_item(CustomMenuItem::new("hide", "Hide ENA"))
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(CustomMenuItem::new("quit", "Quit ENA"));
    SystemTray::new().with_menu(menu)
}

fn toggle_window(app: &tauri::AppHandle) {
    if let Some(win) = app.get_window("main") {
        match win.is_visible() {
            Ok(true) => {
                let _ = win.hide();
            }
            _ => {
                let _ = win.show();
                let _ = win.set_focus();
            }
        }
    }
}

/// Make ENA float over every app and appear on all Spaces (and over fullscreen
/// apps). macOS can drop these after a hide/show, so we re-assert it whenever the
/// window gains focus, not just once at startup.
#[cfg(target_os = "macos")]
fn float_window(win: &tauri::Window) {
    use cocoa::base::{id, NO};
    use objc::{msg_send, sel, sel_impl};
    let _ = win.set_always_on_top(true);
    if let Ok(nsw) = win.ns_window() {
        let nsw = nsw as id;
        unsafe {
            let _: () = msg_send![nsw, setHasShadow: NO];
            // CanJoinAllSpaces (1<<0) | Stationary (1<<4) | FullScreenAuxiliary (1<<8):
            // show on every Space and float over fullscreen apps so the orb follows.
            let behavior: u64 = (1 << 0) | (1 << 4) | (1 << 8);
            let _: () = msg_send![nsw, setCollectionBehavior: behavior];
            // NSStatusWindowLevel (25) - above normal floating so nothing covers it.
            let _: () = msg_send![nsw, setLevel: 25_i64];
        }
    }
}
#[cfg(not(target_os = "macos"))]
fn float_window(win: &tauri::Window) {
    let _ = win.set_always_on_top(true);
}

/// Resolve the per-app index cache dir (…/app_data_dir/index).
fn index_cache_dir(app: &tauri::AppHandle) -> Option<std::path::PathBuf> {
    app.path_resolver().app_data_dir().map(|d| d.join("index"))
}

/// Path to the per-app config file (…/app_data_dir/ena-config.json).
fn config_path(app: &tauri::AppHandle) -> Option<std::path::PathBuf> {
    app.path_resolver().app_data_dir().map(|d| d.join("ena-config.json"))
}

/// Read the whole config object (or {} if none/unreadable).
fn read_config(app: &tauri::AppHandle) -> serde_json::Value {
    config_path(app)
        .and_then(|p| std::fs::read_to_string(p).ok())
        .and_then(|raw| serde_json::from_str(&raw).ok())
        .unwrap_or_else(|| serde_json::json!({}))
}

/// Merge-write the config (preserves other keys).
fn write_config(app: &tauri::AppHandle, v: &serde_json::Value) -> Result<(), String> {
    let p = config_path(app).ok_or("no config dir")?;
    if let Some(dir) = p.parent() {
        std::fs::create_dir_all(dir).map_err(|e| format!("mkdir: {}", e))?;
    }
    std::fs::write(&p, serde_json::to_string(v).unwrap_or_default())
        .map_err(|e| format!("write config: {}", e))
}

/// Read the stored Anthropic API key (config file), if any.
fn stored_api_key(app: &tauri::AppHandle) -> Option<String> {
    read_config(app)
        .get("apiKey")
        .and_then(|x| x.as_str())
        .map(|s| s.trim().to_string())
        .filter(|s| !s.is_empty())
}

/// The saved global hotkey accelerator (defaults to Alt+Space).
fn stored_hotkey(app: &tauri::AppHandle) -> String {
    read_config(app)
        .get("hotkey")
        .and_then(|x| x.as_str())
        .map(|s| s.trim().to_string())
        .filter(|s| !s.is_empty())
        .unwrap_or_else(|| "Alt+Space".to_string())
}

/// Register the toggle hotkey, emitting "ena-toggle" to the window.
fn register_hotkey(app: &tauri::AppHandle, accel: &str) -> Result<(), String> {
    let h = app.clone();
    app.global_shortcut_manager()
        .register(accel, move || {
            if let Some(win) = h.get_window("main") {
                let _ = win.emit("ena-toggle", ());
            }
        })
        .map_err(|e| format!("{}", e))
}

/// Re-assert floating + all-Spaces at runtime (called by the frontend once the
/// webview is up and on every show). In a bundled .app the window is realized
/// after setup(), so flags set at setup() get dropped — this fixes that. The
/// AppKit calls must run on the main thread.
#[tauri::command]
fn refloat(window: tauri::Window) {
    let w = window.clone();
    let _ = window.run_on_main_thread(move || float_window(&w));
}

/// Return current settings to prefill the UI.
#[tauri::command]
fn get_settings(app: tauri::AppHandle) -> serde_json::Value {
    serde_json::json!({ "apiKey": stored_api_key(&app).unwrap_or_default(), "hotkey": stored_hotkey(&app) })
}

/// Save a base64 (data URL) PNG to the user's Downloads folder. Returns the path.
#[tauri::command]
fn save_image(name: String, data: String) -> Result<String, String> {
    use base64::Engine;
    let b64 = data.rsplit(',').next().unwrap_or(&data);
    let bytes = base64::engine::general_purpose::STANDARD
        .decode(b64.trim())
        .map_err(|e| format!("decode: {}", e))?;
    let dir = tauri::api::path::download_dir()
        .or_else(|| std::env::var("HOME").ok().map(|h| std::path::PathBuf::from(h).join("Downloads")))
        .ok_or("no downloads dir")?;
    let _ = std::fs::create_dir_all(&dir);
    let safe: String = name.chars().filter(|c| c.is_alphanumeric() || *c == '.' || *c == '-' || *c == '_').collect();
    let safe = if safe.is_empty() { "ena-stats.png".to_string() } else { safe };
    let path = dir.join(&safe);
    std::fs::write(&path, bytes).map_err(|e| format!("write: {}", e))?;
    Ok(path.to_string_lossy().to_string())
}

/// The local user + device name (for the stats profile). On-device only.
#[tauri::command]
fn get_profile() -> serde_json::Value {
    let user = std::env::var("USER")
        .ok()
        .filter(|s| !s.trim().is_empty())
        .unwrap_or_else(|| "you".into());
    let device = std::process::Command::new("scutil")
        .arg("--get").arg("ComputerName")
        .output().ok()
        .filter(|o| o.status.success())
        .map(|o| String::from_utf8_lossy(&o.stdout).trim().to_string())
        .filter(|s| !s.is_empty())
        .unwrap_or_else(|| format!("{}'s Mac", user));
    serde_json::json!({ "name": user, "device": device })
}

/// Delete every cached project index. Returns how many were removed.
#[tauri::command]
fn clear_index_cache(app: tauri::AppHandle) -> Result<u32, String> {
    let dir = index_cache_dir(&app).ok_or("no cache dir")?;
    let mut n = 0u32;
    if let Ok(rd) = std::fs::read_dir(&dir) {
        for e in rd.flatten() {
            let p = e.path();
            if p.extension().and_then(|x| x.to_str()) == Some("json") && std::fs::remove_file(&p).is_ok() {
                n += 1;
            }
        }
    }
    Ok(n)
}

/// Persist the Anthropic API key to the config file (empty string clears it).
#[tauri::command]
fn set_api_key(app: tauri::AppHandle, key: String) -> Result<(), String> {
    let mut cfg = read_config(&app);
    cfg["apiKey"] = serde_json::Value::String(key.trim().to_string());
    write_config(&app, &cfg)
}

/// Rebind the global summon hotkey. Re-registers it live and persists it; reverts
/// to the previous one if the new accelerator is invalid or already taken.
#[tauri::command]
fn set_hotkey(app: tauri::AppHandle, accel: String) -> Result<(), String> {
    let accel = accel.trim().to_string();
    if accel.is_empty() {
        return Err("Empty shortcut".into());
    }
    let prev = stored_hotkey(&app);
    let _ = app.global_shortcut_manager().unregister_all();
    match register_hotkey(&app, &accel) {
        Ok(_) => {
            let mut cfg = read_config(&app);
            cfg["hotkey"] = serde_json::Value::String(accel.clone());
            let _ = write_config(&app, &cfg);
            Ok(())
        }
        Err(e) => {
            let _ = register_hotkey(&app, &prev); // restore the working one
            Err(format!("Couldn't set {} ({})", accel, e))
        }
    }
}

/// Walk + index a folder locally (the context engine). Heavy IO → spawn_blocking.
/// Persists the digest to the cache dir for instant reopen.
#[tauri::command]
async fn index_folder(app: tauri::AppHandle, path: String) -> Result<engine::ProjectInfo, String> {
    let cache = index_cache_dir(&app);
    tokio::task::spawn_blocking(move || engine::index_folder(path, cache))
        .await
        .map_err(|e| format!("index task failed: {}", e))?
}

/// THE REAL INDEX: the agent (claude/codex) reads the repo and writes the summary.
/// Errors loudly if the agent can't read the repo (no silent mechanical stand-in).
#[tauri::command]
async fn analyze_project(app: tauri::AppHandle, path: String, provider: Option<String>) -> Result<engine::ProjectInfo, String> {
    let cache = index_cache_dir(&app);
    engine::analyze_project(path, cache, provider).await
}

/// Load a previously-persisted digest (fast, no walk). Null if none cached.
#[tauri::command]
async fn load_cached_index(app: tauri::AppHandle, path: String) -> Option<engine::ProjectInfo> {
    let cache = index_cache_dir(&app);
    tokio::task::spawn_blocking(move || engine::load_cached(path, cache))
        .await
        .ok()
        .flatten()
}

/// Cheap freshness token for a folder (git HEAD/dirty or "nogit").
#[tauri::command]
async fn index_freshness(path: String) -> String {
    tokio::task::spawn_blocking(move || engine::freshness_token(&path))
        .await
        .unwrap_or_else(|_| "nogit".to_string())
}

/// Enhance a rough prompt into 3 grounded variations via the user's Claude / Codex CLI.
#[tauri::command]
async fn enhance_prompt(
    app: tauri::AppHandle,
    draft: String,
    project_context: Option<String>,
    provider: Option<String>,
    images: Option<Vec<String>>,
    project_path: Option<String>,
    instructions: Option<String>,
) -> Result<engine::EnhanceResult, String> {
    // Resolve the API key (env wins, else the one saved in settings).
    let api_key = std::env::var("ANTHROPIC_API_KEY").ok()
        .filter(|k| !k.is_empty())
        .or_else(|| stored_api_key(&app));
    engine::enhance_prompt(draft, project_context, provider, api_key, images.unwrap_or_default(), project_path, instructions).await
}

fn main() {
    tauri::Builder::default()
        .system_tray(build_tray())
        .on_system_tray_event(|app, event| match event {
            SystemTrayEvent::LeftClick { .. } => toggle_window(app),
            SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
                "show" => {
                    if let Some(win) = app.get_window("main") {
                        let _ = win.show();
                        let _ = win.set_focus();
                    }
                }
                "hide" => {
                    if let Some(win) = app.get_window("main") {
                        let _ = win.hide();
                    }
                }
                "quit" => app.exit(0),
                _ => {}
            },
            _ => {}
        })
        .setup(|app| {
            let handle = app.handle();

            // Menu-bar utility: no Dock icon, no app-switcher entry (tray only).
            #[cfg(target_os = "macos")]
            app.set_activation_policy(tauri::ActivationPolicy::Accessory);

            if let Some(win) = app.get_window("main") {
                float_window(&win);
                // Re-assert floating + all-Spaces every time ENA comes forward, so a
                // hide/show or Space switch never leaves it stranded on one desktop.
                let w2 = win.clone();
                win.on_window_event(move |event| {
                    if matches!(event, tauri::WindowEvent::Focused(true)) {
                        float_window(&w2);
                    }
                });
                let _ = win.set_focus();
            }

            // Global hotkey (rebindable): summons / dismisses ENA from any app.
            // The frontend decides what toggle means (orb collapse vs hide). If the
            // saved accelerator is invalid or taken, fall back to the default so the
            // app is never left with no summon shortcut.
            let saved = stored_hotkey(&handle);
            if register_hotkey(&handle, &saved).is_err() && saved != "Alt+Space" {
                let _ = register_hotkey(&handle, "Alt+Space");
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![index_folder, analyze_project, load_cached_index, index_freshness, enhance_prompt, get_settings, set_api_key, set_hotkey, clear_index_cache, get_profile, save_image, refloat])
        .run(tauri::generate_context!())
        .expect("error while running ENA");
}
