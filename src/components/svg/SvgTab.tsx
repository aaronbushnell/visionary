import { useState, useCallback } from "react";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { DropZone } from "../DropZone";
import { SvgStats } from "./SvgStats";
import { runSvgo } from "../../lib/svgo";
import { SvgState } from "../../types";

export function SvgTab() {
  const [state, setState] = useState<SvgState | null>(null);
  const [useCurrentColor, setUseCurrentColor] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleDrop = useCallback(async (paths: string[]) => {
    try {
      const path = paths[0];
      const svgText = await readTextFile(path);
      const result = runSvgo(svgText, false);
      setState({
        path,
        original: svgText,
        optimized: result.data,
        inputBytes: result.inputBytes,
        outputBytes: result.outputBytes,
      });
      setUseCurrentColor(false);
    } catch (e) {
      showToast(`Error: ${String(e)}`);
    }
  }, []);

  const handleCurrentColorToggle = (checked: boolean) => {
    setUseCurrentColor(checked);
    if (!state) return;
    const result = runSvgo(state.original, checked);
    setState((prev) =>
      prev
        ? { ...prev, optimized: result.data, outputBytes: result.outputBytes }
        : null
    );
  };

  const handleCopy = async () => {
    if (!state) return;
    try {
      await navigator.clipboard.writeText(state.optimized);
      showToast("Copied!");
    } catch {
      showToast("Copy failed");
    }
  };

  const handleSave = async () => {
    if (!state) return;
    try {
      await writeTextFile(state.path, state.optimized);
      showToast("Saved!");
    } catch (e) {
      showToast(`Save failed: ${String(e)}`);
    }
  };

  const handleClear = () => {
    setState(null);
    setUseCurrentColor(false);
  };

  return (
    <div className="flex-1 flex flex-col p-4 gap-3 min-h-0">
      {/* DropZone always mounted: shows empty-state UI when no children,
          or wraps the preview with a drag-ring overlay when an SVG is loaded */}
      <DropZone
        acceptedExtensions={["svg"]}
        onDrop={handleDrop}
        className="flex-1 flex flex-col gap-3 min-h-0"
        label="Drop an SVG file"
        sublabel="Optimizes with SVGO"
      >
        {state ? (
          <>
            {/* Preview */}
            <div className="flex-1 bg-neutral-900 rounded-lg border border-neutral-800 flex items-center justify-center p-6 overflow-hidden min-h-0">
              <div
                className="w-full h-full flex items-center justify-center [&_svg]:max-w-full [&_svg]:max-h-full [&_svg]:w-auto [&_svg]:h-auto"
                dangerouslySetInnerHTML={{ __html: state.optimized }}
              />
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4 shrink-0 flex-wrap">
              <SvgStats
                inputBytes={state.inputBytes}
                outputBytes={state.outputBytes}
              />

              <label className="flex items-center gap-2 cursor-pointer text-sm text-neutral-300 ml-auto">
                <input
                  type="checkbox"
                  checked={useCurrentColor}
                  onChange={(e) => handleCurrentColorToggle(e.target.checked)}
                  className="accent-blue-500"
                />
                Replace fills with currentColor
              </label>

              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="px-4 py-1.5 bg-neutral-700 hover:bg-neutral-600 text-neutral-200 text-sm rounded-lg font-medium transition-colors"
                >
                  Copy SVG
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg font-medium transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={handleClear}
                  className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 text-sm rounded-lg font-medium transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          </>
        ) : undefined}
      </DropZone>

      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-neutral-700 text-white px-4 py-2 rounded-lg text-sm shadow-lg pointer-events-none">
          {toast}
        </div>
      )}
    </div>
  );
}
