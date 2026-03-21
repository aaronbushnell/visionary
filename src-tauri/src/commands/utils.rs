use serde::Serialize;
use std::path::Path;

#[derive(Serialize)]
pub struct FileSizeResult {
    pub size: u64,
}

#[tauri::command]
pub fn get_file_size(path: String) -> Result<FileSizeResult, String> {
    let meta = std::fs::metadata(Path::new(&path)).map_err(|e| e.to_string())?;
    Ok(FileSizeResult { size: meta.len() })
}
