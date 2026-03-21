import { useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { DropZone } from "../DropZone";
import { FileList } from "../compress/FileList";
import { ResizeDimensionInput } from "./ResizeDimensionInput";
import { ResizeFile, ResizeResult } from "../../types";

let idCounter = 0;
const nextId = () => String(++idCounter);

async function getFileSize(path: string): Promise<number> {
  try {
    const { size } = await invoke<{ size: number }>("get_file_size", { path });
    return size;
  } catch {
    return 0;
  }
}

export function ResizeTab() {
  const [files, setFiles] = useState<ResizeFile[]>([]);
  const [maxPx, setMaxPx] = useState(1920);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleDrop = useCallback(async (paths: string[]) => {
    const newFiles: ResizeFile[] = await Promise.all(
      paths.map(async (p) => {
        const size = await getFileSize(p);
        return {
          id: nextId(),
          path: p,
          name: p.split("/").pop() ?? p,
          inputBytes: size,
          status: "pending" as const,
        };
      })
    );
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const handleResizeAll = async () => {
    const pending = files.filter((f) => f.status === "pending");
    if (pending.length === 0) return;
    setRunning(true);
    setProgress({ done: 0, total: pending.length });

    const queue = [...pending];
    let completed = 0;

    const worker = async () => {
      while (queue.length > 0) {
        const file = queue.shift()!;
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id ? { ...f, status: "processing" } : f
          )
        );
        try {
          const result = await invoke<ResizeResult>("resize_to_webp", {
            input: { path: file.path, max_px: maxPx },
          });
          setFiles((prev) =>
            prev.map((f) =>
              f.id === file.id
                ? {
                    ...f,
                    status: "done",
                    outputBytes: result.output_bytes,
                    outputPath: result.output_path,
                    origWidth: result.orig_width,
                    origHeight: result.orig_height,
                    outWidth: result.out_width,
                    outHeight: result.out_height,
                  }
                : f
            )
          );
        } catch (e) {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === file.id
                ? { ...f, status: "error", error: String(e) }
                : f
            )
          );
        }
        completed++;
        setProgress({ done: completed, total: pending.length });
      }
    };

    const CONCURRENCY = 3;
    await Promise.all(
      Array.from({ length: Math.min(CONCURRENCY, pending.length) }, worker)
    );

    setRunning(false);
    setProgress(null);
    showToast("Done!");
  };

  const handleClear = () => setFiles([]);

  return (
    <div className="flex-1 flex flex-col p-4 gap-3 min-h-0">
      <div className="flex items-center justify-between shrink-0">
        <ResizeDimensionInput
          value={maxPx}
          onChange={setMaxPx}
          disabled={running}
        />
      </div>

      <DropZone
        acceptedExtensions={["jpg", "jpeg", "png"]}
        onDrop={handleDrop}
        className="shrink-0 h-28"
        label="Drop JPG / PNG files"
        sublabel="Resizes and converts to lossless WebP"
      />

      {files.length > 0 && (
        <div className="flex-1 flex flex-col gap-3 min-h-0">
          <FileList files={files} />

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleResizeAll}
              disabled={
                running || files.every((f) => f.status !== "pending")
              }
              className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm rounded-lg font-medium transition-colors"
            >
              {running && (
                <svg className="animate-spin w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                </svg>
              )}
              {progress
                ? `${progress.done} / ${progress.total} done…`
                : "Resize + Convert"}
            </button>
            <button
              onClick={handleClear}
              disabled={running}
              className="px-4 py-1.5 bg-neutral-700 hover:bg-neutral-600 text-neutral-200 text-sm rounded-lg font-medium transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-neutral-700 text-white px-4 py-2 rounded-lg text-sm shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
