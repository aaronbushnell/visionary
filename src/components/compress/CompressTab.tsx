import { useState, useCallback, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { readFile } from "@tauri-apps/plugin-fs";
import { isPermissionGranted, requestPermission, sendNotification } from "@tauri-apps/plugin-notification";
import { DropZone } from "../DropZone";
import { FileList } from "./FileList";
import { Toggle } from "../Toggle";
import { CompressFile, CompressResult, ResizeResult } from "../../types";

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

export function CompressTab() {
  const [files, setFiles] = useState<CompressFile[]>([]);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [outputFormat, setOutputFormat] = useState<"webp" | "avif">("webp");
  const [resizeEnabled, setResizeEnabled] = useState(false);
  const [maxPx, setMaxPx] = useState(1920);
  const [toast, setToast] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const prevUrlRef = useRef<string | null>(null);

  const selectedFile = files.find((f) => f.id === selectedId) ?? null;

  useEffect(() => {
    if (prevUrlRef.current) {
      URL.revokeObjectURL(prevUrlRef.current);
      prevUrlRef.current = null;
    }
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }
    let alive = true;
    readFile(selectedFile.path).then((bytes) => {
      if (!alive) return;
      const ext = selectedFile.path.split(".").pop()?.toLowerCase();
      const mime = ext === "png" ? "image/png" : "image/jpeg";
      const blob = new Blob([bytes], { type: mime });
      const url = URL.createObjectURL(blob);
      prevUrlRef.current = url;
      setPreviewUrl(url);
    }).catch(() => {
      if (alive) setPreviewUrl(null);
    });
    return () => { alive = false; };
  }, [selectedFile?.path]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleDrop = useCallback(async (paths: string[]) => {
    const newFiles: CompressFile[] = await Promise.all(
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
    setSelectedId((prev) => prev ?? newFiles[0]?.id ?? null);
  }, []);

  const handleConvertAll = async () => {
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
          if (resizeEnabled) {
            const cmd = outputFormat === "avif" ? "resize_to_avif" : "resize_to_webp";
            const result = await invoke<ResizeResult>(cmd, {
              input: { path: file.path, max_px: maxPx },
            });
            setFiles((prev) =>
              prev.map((f) =>
                f.id === file.id
                  ? { ...f, status: "done", outputBytes: result.output_bytes, outputPath: result.output_path }
                  : f
              )
            );
          } else {
            const cmd = outputFormat === "avif" ? "jpg_to_avif" : "jpg_to_webp";
            const result = await invoke<CompressResult>(cmd, {
              path: file.path,
            });
            setFiles((prev) =>
              prev.map((f) =>
                f.id === file.id
                  ? { ...f, status: "done", outputBytes: result.output_bytes, outputPath: result.output_path }
                  : f
              )
            );
          }
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
    showToast("All done");

    let granted = await isPermissionGranted();
    if (!granted) {
      granted = (await requestPermission()) === "granted";
    }
    if (granted) {
      const doneCount = pending.length;
      sendNotification({
        title: "Visionary",
        body: `${doneCount} image${doneCount === 1 ? "" : "s"} compressed successfully`,
      });
    }
  };

  const handleClear = () => { setFiles([]); setSelectedId(null); };

  return (
    <div className="flex-1 flex flex-col p-4 gap-3 min-h-0">
      <DropZone
        acceptedExtensions={["jpg", "jpeg", "png"]}
        onDrop={handleDrop}
        className="flex-1 flex flex-col gap-3 min-h-0"
        label="Drop JPG or PNG files"
        sublabel={`Converts to ${outputFormat.toUpperCase()}`}
      >
        {files.length > 0 ? (
          <>
            <div className="flex-1 flex gap-3 min-h-0">
              {/* File list */}
              <div className="w-64 flex flex-col min-h-0">
                <FileList files={files} selectedId={selectedId} onSelect={setSelectedId} />
              </div>

              {/* Preview */}
              <div
                className="flex-1 rounded-xl border border-zinc-800/60 overflow-hidden flex items-center justify-center"
                style={{
                  background: "#0e0e12",
                  backgroundImage: "radial-gradient(circle, #1c1c26 1px, transparent 1px)",
                  backgroundSize: "18px 18px",
                }}
              >
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt={selectedFile?.name}
                    className="max-w-full max-h-full object-contain p-6"
                  />
                ) : (
                  <span className="text-[12px] text-zinc-700">Select a file to preview</span>
                )}
              </div>
            </div>

            {/* Options + actions */}
            <div className="flex items-center gap-3 shrink-0 flex-wrap pt-1 border-t border-zinc-900">
              {/* Format toggle */}
              <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 gap-0.5">
                {(["webp", "avif"] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => !running && setOutputFormat(fmt)}
                    disabled={running}
                    className={`px-2.5 py-1 rounded-md text-[12px] font-medium transition-all disabled:opacity-40 ${
                      outputFormat === fmt
                        ? "bg-[var(--accent)] text-white"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {fmt.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Resize option */}
              <label className="flex items-center gap-2 cursor-pointer">
                <Toggle
                  checked={resizeEnabled}
                  onChange={setResizeEnabled}
                  disabled={running}
                />
                <span className={`text-[13px] ${resizeEnabled ? "text-zinc-300" : "text-zinc-500"}`}>
                  Scale down if larger than
                </span>
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  value={maxPx}
                  min={1}
                  max={16000}
                  disabled={!resizeEnabled || running}
                  onChange={(e) => {
                    const n = parseInt(e.target.value, 10);
                    if (!isNaN(n) && n > 0) setMaxPx(n);
                  }}
                  className="w-16 px-2 py-1 bg-zinc-900 border border-zinc-800 text-zinc-200 text-[13px] rounded-md text-right focus:outline-none focus:ring-1 focus:ring-[var(--accent)] focus:border-[var(--accent)] disabled:opacity-40 [appearance:textfield] tabular-nums"
                />
                <span className={`text-[13px] ${resizeEnabled ? "text-zinc-500" : "text-zinc-700"}`}>
                  px
                </span>
              </div>

              <div className="flex-1" />

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleConvertAll}
                  disabled={running || files.every((f) => f.status !== "pending")}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-40 text-white text-[13px] rounded-lg font-medium transition-all"
                >
                  {running && (
                    <svg className="animate-spin w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
                      <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"/>
                    </svg>
                  )}
                  {progress ? `${progress.done} / ${progress.total}` : "Convert All"}
                </button>
                <button
                  onClick={handleClear}
                  disabled={running}
                  className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 text-[13px] rounded-lg font-medium transition-all disabled:opacity-40"
                >
                  Clear
                </button>
              </div>
            </div>
          </>
        ) : undefined}
      </DropZone>

      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-zinc-900 border border-zinc-800 text-zinc-300 px-4 py-2 rounded-lg text-[13px] shadow-2xl pointer-events-none animate-toast">
          {toast}
        </div>
      )}
    </div>
  );
}
