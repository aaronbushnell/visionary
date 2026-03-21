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

export function DropZone({
  acceptedExtensions,
  onDrop,
  children,
  className = "",
  label,
  sublabel,
}: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  // Keep refs so the single registered listener always sees the latest values
  // without needing to re-register (which would cause duplicate listeners).
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
        // If cleanup already ran before this Promise resolved, unlisten immediately.
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
  }, []); // register once — refs handle value updates

  if (children) {
    return (
      <div
        className={`${className} ${isDragging ? "ring-2 ring-blue-500 ring-inset" : ""}`}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors ${
        isDragging
          ? "border-blue-400 bg-blue-500/10"
          : "border-neutral-700 bg-neutral-900/50"
      } ${className}`}
    >
      <div className="text-3xl mb-2 opacity-50">
        {isDragging ? "↓" : "↑"}
      </div>
      <p className="text-neutral-400 text-sm font-medium">
        {label ?? "Drop files here"}
      </p>
      {sublabel && (
        <p className="text-neutral-600 text-xs mt-1">{sublabel}</p>
      )}
    </div>
  );
}
