import { ReactNode, useState, useEffect, useRef } from "react";
import { getCurrentWebview } from "@tauri-apps/api/webview";

interface DropZoneProps {
  acceptedExtensions: string[];
  onDrop: (paths: string[]) => void;
  children?: ReactNode;
  className?: string;
  label?: string;
  sublabel?: string;
}

function UploadIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 15V3m0 0-4 4m4-4 4 4" />
      <path d="M2 17v1a3 3 0 003 3h14a3 3 0 003-3v-1" />
    </svg>
  );
}

export function DropZone({
  acceptedExtensions,
  onDrop,
  children,
  className = "",
  label,
  sublabel,
}: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const acceptedRef = useRef(acceptedExtensions);
  acceptedRef.current = acceptedExtensions;
  const onDropRef = useRef(onDrop);
  onDropRef.current = onDrop;

  useEffect(() => {
    let cancelled = false;
    let unlisten: (() => void) | undefined;

    getCurrentWebview()
      .onDragDropEvent((event) => {
        if (event.payload.type === "enter" || event.payload.type === "over") {
          setIsDragging(true);
        } else if (event.payload.type === "leave") {
          setIsDragging(false);
        } else if (event.payload.type === "drop") {
          setIsDragging(false);
          const paths = event.payload.paths.filter((p) => {
            const ext = p.split(".").pop()?.toLowerCase() ?? "";
            return acceptedRef.current.includes(ext);
          });
          if (paths.length > 0) {
            onDropRef.current(paths);
          }
        }
      })
      .then((fn) => {
        if (cancelled) {
          fn();
        } else {
          unlisten = fn;
        }
      });

    return () => {
      cancelled = true;
      unlisten?.();
    };
  }, []);

  if (children) {
    return (
      <div
        className={`${className} rounded-xl transition-all duration-150 ${
          isDragging
            ? "ring-1 ring-[var(--accent)] ring-inset bg-[var(--accent-dim)]"
            : ""
        }`}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl border border-dashed transition-all duration-150 ${
        isDragging
          ? "border-[var(--accent)] bg-[var(--accent-dim)]"
          : "border-zinc-800 hover:border-zinc-700 bg-zinc-900/30"
      } ${className}`}
    >
      <div
        className={`mb-2.5 transition-colors duration-150 ${
          isDragging ? "text-[var(--accent)]" : "text-zinc-600"
        }`}
      >
        <UploadIcon />
      </div>
      <p
        className={`text-[13px] font-medium transition-colors duration-150 ${
          isDragging ? "text-zinc-300" : "text-zinc-500"
        }`}
      >
        {isDragging ? "Release to add" : (label ?? "Drop files here")}
      </p>
      {sublabel && !isDragging && (
        <p className="text-zinc-700 text-xs mt-1">{sublabel}</p>
      )}
    </div>
  );
}
