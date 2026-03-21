import { useEffect, useRef } from "react";
import { getCurrentWebview } from "@tauri-apps/api/webview";

type DragDropHandler = (paths: string[]) => void;

export function useDragDrop(
  acceptedExtensions: string[],
  onDrop: DragDropHandler
) {
  const onDropRef = useRef(onDrop);
  onDropRef.current = onDrop;

  const acceptedRef = useRef(acceptedExtensions);
  acceptedRef.current = acceptedExtensions;

  useEffect(() => {
    let unlisten: (() => void) | undefined;

    getCurrentWebview()
      .onDragDropEvent((event) => {
        if (event.payload.type === "drop") {
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
        unlisten = fn;
      });

    return () => {
      unlisten?.();
    };
  }, []);
}
