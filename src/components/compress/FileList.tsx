import { CompressFile, ResizeFile } from "../../types";

type AnyFile = CompressFile | ResizeFile;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function StatusIcon({ status }: { status: AnyFile["status"] }) {
  if (status === "pending") {
    return (
      <span className="w-1.5 h-1.5 rounded-full bg-zinc-700 shrink-0" />
    );
  }
  if (status === "processing") {
    return (
      <svg
        className="animate-spin w-3.5 h-3.5 text-[var(--accent)] shrink-0"
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle
          className="opacity-20"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3"
        />
        <path
          className="opacity-80"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"
        />
      </svg>
    );
  }
  if (status === "done") {
    return (
      <svg
        className="w-3.5 h-3.5 text-emerald-400 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    );
  }
  if (status === "error") {
    return (
      <svg
        className="w-3.5 h-3.5 text-red-400 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    );
  }
  return null;
}

interface FileListProps {
  files: AnyFile[];
}

export function FileList({ files }: FileListProps) {
  if (files.length === 0) return null;

  return (
    <div className="flex flex-col gap-px overflow-y-auto">
      {files.map((file, i) => {
        const savings =
          file.outputBytes != null && file.inputBytes
            ? Math.round(
                ((file.inputBytes - file.outputBytes) / file.inputBytes) * 100
              )
            : null;

        const isProcessing = file.status === "processing";
        const isError = file.status === "error";

        return (
          <div
            key={file.id}
            className={`flex items-center gap-2.5 px-3 py-[7px] rounded-lg text-[13px] transition-colors animate-entry ${
              isProcessing
                ? "bg-[var(--accent-dim)] ring-1 ring-[var(--accent-border)] ring-inset"
                : isError
                ? "bg-red-500/5"
                : "bg-zinc-900/50 hover:bg-zinc-900"
            }`}
            style={{ animationDelay: `${i * 20}ms` }}
          >
            {/* Status icon */}
            <div className="w-4 flex items-center justify-center shrink-0">
              <StatusIcon status={file.status} />
            </div>

            {/* File name */}
            <span className="flex-1 truncate text-zinc-300 min-w-0">
              {file.name}
            </span>

            {/* Sizes */}
            <span className="text-zinc-600 shrink-0 tabular-nums text-xs">
              {formatBytes(file.inputBytes)}
            </span>

            {file.outputBytes != null ? (
              <>
                <span className="text-zinc-800 shrink-0 text-xs">→</span>
                <span className="text-zinc-400 shrink-0 tabular-nums text-xs">
                  {formatBytes(file.outputBytes)}
                </span>
                {savings != null && savings > 0 && (
                  <span className="shrink-0 text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded text-[11px] font-medium tabular-nums">
                    −{savings}%
                  </span>
                )}
              </>
            ) : (
              <span className="text-zinc-800 shrink-0 tabular-nums text-xs w-10 text-right">
                —
              </span>
            )}

            {isError && (
              <span
                className="text-red-400/70 text-[11px] shrink-0 max-w-[80px] truncate"
                title={"error" in file ? file.error : undefined}
              >
                Failed
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
