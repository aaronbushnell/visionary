import { useState, useCallback } from "react";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { DropZone } from "../DropZone";
import { Toggle } from "../Toggle";
import { SvgStats } from "./SvgStats";
import { runSvgo } from "../../lib/svgo";
import { SvgState } from "../../types";

type ViewMode = "preview" | "code";

/** Very basic XML pretty-printer so code view is readable, not a minified wall of text. */
function formatXml(xml: string): string {
  let indent = 0;
  const lines = xml
    .replace(/>\s*</g, ">\n<")
    .split("\n")
    .map((raw) => raw.trim())
    .filter(Boolean);

  return lines
    .map((line) => {
      if (line.match(/^<\//)) indent = Math.max(0, indent - 1);
      const out = "  ".repeat(indent) + line;
      if (
        line.match(/^<[^/?!]/) &&
        !line.match(/\/>$/) &&
        !line.match(/<\/.*>$/)
      )
        indent++;
      return out;
    })
    .join("\n");
}

function PreviewIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="14" height="10" rx="2" />
      <path d="M1 11l3.5-3.5 3 3 3-3.5 4.5 4" />
      <circle cx="11.5" cy="6.5" r="1" fill="currentColor" strokeWidth="0" />
    </svg>
  );
}

function CodeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="5 4 1 8 5 12" />
      <polyline points="11 4 15 8 11 12" />
    </svg>
  );
}

export function SvgTab() {
  const [state, setState] = useState<SvgState | null>(null);
  const [useCurrentColor, setUseCurrentColor] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("preview");
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
      setViewMode("preview");
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
      showToast("Copied to clipboard");
    } catch {
      showToast("Copy failed");
    }
  };

  const handleSave = async () => {
    if (!state) return;
    try {
      await writeTextFile(state.path, state.optimized);
      showToast("Saved");
    } catch (e) {
      showToast(`Save failed: ${String(e)}`);
    }
  };

  const handleClear = () => {
    setState(null);
    setUseCurrentColor(false);
    setViewMode("preview");
  };

  return (
    <div className="flex-1 flex flex-col p-4 gap-3 min-h-0">
      <DropZone
        acceptedExtensions={["svg"]}
        onDrop={handleDrop}
        className="flex-1 flex flex-col gap-3 min-h-0"
        label="Drop an SVG file"
        sublabel="Optimizes with SVGO"
      >
        {state ? (
          <>
            {/* Preview / Code pane */}
            <div
              className="relative flex-1 rounded-xl border border-zinc-800/60 overflow-hidden min-h-0"
              style={{
                background: "#0e0e12",
                backgroundImage:
                  viewMode === "preview"
                    ? "radial-gradient(circle, #1c1c26 1px, transparent 1px)"
                    : "none",
                backgroundSize: "18px 18px",
              }}
            >
              {viewMode === "preview" ? (
                <div className="w-full h-full flex items-center justify-center p-6 [&_svg]:max-w-full [&_svg]:max-h-full [&_svg]:w-auto [&_svg]:h-auto"
                  dangerouslySetInnerHTML={{ __html: state.optimized }}
                />
              ) : (
                <pre className="w-full h-full p-4 overflow-auto text-[12px] leading-relaxed font-mono text-zinc-400 select-text">
                  {formatXml(state.optimized)}
                </pre>
              )}

              {/* View toggle — top right corner of pane */}
              <div className="absolute top-2.5 right-2.5 flex items-center bg-zinc-900/90 border border-zinc-800 rounded-md p-0.5 gap-0.5 backdrop-blur-sm">
                <button
                  onClick={() => setViewMode("preview")}
                  title="Preview"
                  className={`p-1.5 rounded transition-colors ${
                    viewMode === "preview"
                      ? "bg-zinc-700 text-zinc-100"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <PreviewIcon />
                </button>
                <button
                  onClick={() => setViewMode("code")}
                  title="Code"
                  className={`p-1.5 rounded transition-colors ${
                    viewMode === "code"
                      ? "bg-zinc-700 text-zinc-100"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <CodeIcon />
                </button>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3 shrink-0 flex-wrap pt-1 border-t border-zinc-900">
              <SvgStats
                inputBytes={state.inputBytes}
                outputBytes={state.outputBytes}
              />

              <div className="flex-1" />

              <label className="flex items-center gap-2 cursor-pointer">
                <Toggle
                  checked={useCurrentColor}
                  onChange={handleCurrentColorToggle}
                />
                <span className="text-[13px] text-zinc-500 hover:text-zinc-400 transition-colors">
                  Replace fills with currentColor
                </span>
              </label>

              <div className="flex gap-1.5">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 text-[13px] rounded-lg font-medium transition-all"
                >
                  Copy
                </button>
                <button
                  onClick={handleSave}
                  className="px-3 py-1.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-[13px] rounded-lg font-medium transition-all"
                >
                  Save
                </button>
                <button
                  onClick={handleClear}
                  className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-600 hover:text-zinc-400 text-[13px] rounded-lg font-medium transition-all"
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
