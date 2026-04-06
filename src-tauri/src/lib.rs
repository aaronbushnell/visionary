mod commands;
mod error;

use commands::compress::{jpg_to_avif, jpg_to_webp};
use commands::resize::{resize_to_avif, resize_to_webp};
use commands::utils::get_file_size;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_notification::init())
        .invoke_handler(tauri::generate_handler![
            jpg_to_webp,
            jpg_to_avif,
            resize_to_webp,
            resize_to_avif,
            get_file_size,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
