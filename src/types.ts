export type TabId = "svg" | "compress";

export interface SvgState {
  path: string;
  original: string;
  optimized: string;
  inputBytes: number;
  outputBytes: number;
}

export interface CompressFile {
  id: string;
  path: string;
  name: string;
  inputBytes: number;
  outputBytes?: number;
  outputPath?: string;
  status: "pending" | "processing" | "done" | "error";
  error?: string;
}

export interface ResizeFile {
  id: string;
  path: string;
  name: string;
  inputBytes: number;
  origWidth?: number;
  origHeight?: number;
  outWidth?: number;
  outHeight?: number;
  outputBytes?: number;
  outputPath?: string;
  status: "pending" | "processing" | "done" | "error";
  error?: string;
}

export interface CompressResult {
  input_path: string;
  output_path: string;
  input_bytes: number;
  output_bytes: number;
}

export interface ResizeResult {
  input_path: string;
  output_path: string;
  input_bytes: number;
  output_bytes: number;
  orig_width: number;
  orig_height: number;
  out_width: number;
  out_height: number;
}
