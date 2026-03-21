use crate::error::AppError;
use image::ImageReader;
use serde::Serialize;
use std::fs;
use std::path::PathBuf;

#[derive(Serialize)]
pub struct CompressResult {
    pub input_path: String,
    pub output_path: String,
    pub input_bytes: u64,
    pub output_bytes: u64,
}

#[tauri::command]
pub async fn jpg_to_webp(path: String) -> Result<CompressResult, AppError> {
    tauri::async_runtime::spawn_blocking(move || {
        let input_path = PathBuf::from(&path);
        let input_bytes = fs::metadata(&input_path)?.len();

        let img = ImageReader::open(&input_path)?.decode()?.to_rgba8();
        let (width, height) = img.dimensions();

        let mut config = webp::WebPConfig::new()
            .map_err(|_| AppError::WebP("Failed to create WebP config".to_string()))?;
        // Lossy at q82: typically 25-40% smaller than equivalent JPEG, visually indistinguishable.
        // Lossless would be larger than the source JPEG because JPEG artifacts look like noise
        // to a lossless encoder — there's nothing to preserve losslessly from an already-lossy source.
        config.lossless = 0;
        config.quality = 80.0;

        let encoder = webp::Encoder::from_rgba(img.as_raw(), width, height);
        let webp_data = encoder
            .encode_advanced(&config)
            .map_err(|_| AppError::WebP("WebP encoding failed".to_string()))?;

        let output_path = input_path.with_extension("webp");
        fs::write(&output_path, webp_data.as_ref() as &[u8])?;

        let output_bytes = fs::metadata(&output_path)?.len();

        Ok(CompressResult {
            input_path: path,
            output_path: output_path.to_string_lossy().to_string(),
            input_bytes,
            output_bytes,
        })
    })
    .await
    .map_err(|e| AppError::Other(e.to_string()))?
}
