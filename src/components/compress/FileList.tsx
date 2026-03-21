import { CompressFile, ResizeFile } from "../../types";

type AnyFile = CompressFile | ResizeFile;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

interface FileListProps {
  files: AnyFile[];
}

export function FileList({ files }: FileListProps) {
  if (files.length === 0) return null;

  return (
    <div className="flex flex-col gap-1 overflow-y-auto">
      {files.map((file) => {
        const savings =
          file.outputBytes != null && file.inputBytes
            ? Math.round(
                ((file.inputBytes - file.outputBytes) / file.inputBytes) * 100
              )
            : null;

        const isProcessing = file.status === "processing";

        return (
          <div
            key={file.id}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              isProcessing
                ? "bg-blue-500/10 ring-1 ring-blue-500/30"
                : "bg-neutral-900/60"
            }`}
          >
            <span className="flex-1 truncate text-neutral-300 min-w-0">
              {file.name}
            </span>
            <span className="text-neutral-500 shrink-0 w-16 text-right">
              {formatBytes(file.inputBytes)}
            </span>
            {file.outputBytes != null ? (
              <>
                <span className="text-neutral-400 shrink-0">→</span>
                <span className="text-white shrink-0 w-16 text-right">
                  {formatBytes(file.outputBytes)}
                </span>
                {savings != null && savings > 0 && (
                  <span className="text-green-400 shrink-0 w-12 text-right">
                    −{savings}%
                  </span>
                )}
              </>
            ) : (
              <span className="text-neutral-600 shrink-0 w-16 text-right">
                —
              </span>
            )}
            <span className="shrink-0 w-20 text-right">
              {file.status === "pending" && (
                <span className="text-neutral-600">Pending</span>
              )}
              {file.status === "processing" && (
                <span className="flex items-center gap-1.5 text-blue-400">
                  <svg className="animate-spin w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                  </svg>
                  Converting
                </span>
              )}
              {file.status === "done" && (
                <span className="text-green-400">Done</span>
              )}
              {file.status === "error" && (
                <span className="text-red-400" title={file.error}>
                  Error
                </span>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}
