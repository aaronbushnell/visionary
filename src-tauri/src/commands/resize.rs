use crate::error::AppError;
use image::{imageops::FilterType, ExtendedColorType, ImageEncoder, ImageReader};
use serde::{Deserialize, Serialize};
use std::fs;
use std::io::Cursor;
use std::path::PathBuf;

#[derive(Deserialize)]
pub struct ResizeInput {
    pub path: String,
    pub max_px: u32,
}

#[derive(Serialize)]
pub struct ResizeResult {
    pub input_path: String,
    pub output_path: String,
    pub input_bytes: u64,
    pub output_bytes: u64,
    pub orig_width: u32,
    pub orig_height: u32,
    pub out_width: u32,
    pub out_height: u32,
}

#[tauri::command]
pub async fn resize_to_webp(input: ResizeInput) -> Result<ResizeResult, AppError> {
    tauri::async_runtime::spawn_blocking(move || {
        let input_path = PathBuf::from(&input.path);
        let input_bytes = fs::metadata(&input_path)?.len();

        let img = ImageReader::open(&input_path)?.decode()?;
        let orig_width = img.width();
        let orig_height = img.height();

        let longest = orig_width.max(orig_height);
        let (out_width, out_height) = if longest > input.max_px {
            let scale = input.max_px as f64 / longest as f64;
            let w = ((orig_width as f64 * scale).round() as u32).max(1);
            let h = ((orig_height as f64 * scale).round() as u32).max(1);
            (w, h)
        } else {
            (orig_width, orig_height)
        };

        let resized = img.resize_exact(out_width, out_height, FilterType::Lanczos3);
        let rgb = resized.to_rgb8();

        let mut config = webp::WebPConfig::new()
            .map_err(|_| AppError::WebP("Failed to create WebP config".to_string()))?;
        config.lossless = 0;
        config.quality = 80.0;
        config.method = 2;

        let encoder = webp::Encoder::from_rgb(rgb.as_raw(), out_width, out_height);
        let webp_data = encoder
            .encode_advanced(&config)
            .map_err(|_| AppError::WebP("WebP encoding failed".to_string()))?;

        let output_path = input_path.with_extension("webp");
        fs::write(&output_path, webp_data.as_ref() as &[u8])?;

        let output_bytes = fs::metadata(&output_path)?.len();

        Ok(ResizeResult {
            input_path: input.path,
            output_path: output_path.to_string_lossy().to_string(),
            input_bytes,
            output_bytes,
            orig_width,
            orig_height,
            out_width,
            out_height,
        })
    })
    .await
    .map_err(|e| AppError::Other(e.to_string()))?
}

#[tauri::command]
pub async fn resize_to_avif(input: ResizeInput) -> Result<ResizeResult, AppError> {
    tauri::async_runtime::spawn_blocking(move || {
        let input_path = PathBuf::from(&input.path);
        let input_bytes = fs::metadata(&input_path)?.len();

        let img = ImageReader::open(&input_path)?.decode()?;
        let orig_width = img.width();
        let orig_height = img.height();

        let longest = orig_width.max(orig_height);
        let (out_width, out_height) = if longest > input.max_px {
            let scale = input.max_px as f64 / longest as f64;
            let w = ((orig_width as f64 * scale).round() as u32).max(1);
            let h = ((orig_height as f64 * scale).round() as u32).max(1);
            (w, h)
        } else {
            (orig_width, orig_height)
        };

        let resized = img.resize_exact(out_width, out_height, FilterType::Lanczos3);
        let rgb = resized.to_rgb8();

        let mut output: Vec<u8> = Vec::new();
        {
            let cursor = Cursor::new(&mut output);
            let encoder = image::codecs::avif::AvifEncoder::new_with_speed_quality(cursor, 6, 75);
            encoder
                .write_image(rgb.as_raw(), out_width, out_height, ExtendedColorType::Rgb8)
                .map_err(|e| AppError::Other(e.to_string()))?;
        }

        let output_path = input_path.with_extension("avif");
        fs::write(&output_path, &output)?;

        let output_bytes = fs::metadata(&output_path)?.len();

        Ok(ResizeResult {
            input_path: input.path,
            output_path: output_path.to_string_lossy().to_string(),
            input_bytes,
            output_bytes,
            orig_width,
            orig_height,
            out_width,
            out_height,
        })
    })
    .await
    .map_err(|e| AppError::Other(e.to_string()))?
}
