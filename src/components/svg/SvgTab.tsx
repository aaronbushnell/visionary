import { useState, useCallback, useEffect } from "react";
import { readText } from "@tauri-apps/plugin-clipboard-manager";
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

function UploadIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 15V3m0 0-4 4m4-4 4 4" />
      <path d="M2 17v1a3 3 0 003 3h14a3 3 0 003-3v-1" />
    </svg>
  );
}

function ClipboardIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="1" width="6" height="3" rx="1" />
      <path d="M10 2h2a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2h2" />
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

  const handlePasteSvg = useCallback((svgText: string) => {
    try {
      const result = runSvgo(svgText, false);
      setState({
        path: "",
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

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const text = e.clipboardData?.getData("text/plain") ?? "";
      if (/<svg[\s>]/i.test(text)) {
        e.preventDefault();
        handlePasteSvg(text);
      }
    };
    window.addEventListener("paste", handlePaste);

    return () => {
      window.removeEventListener("paste", handlePaste);
    };
  }, [handlePasteSvg]);

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
                  onClick={async () => {
                    const text = await readText();
                    if (/<svg[\s>]/i.test(text)) handlePasteSvg(text);
                    else showToast("No SVG in clipboard");
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 text-[13px] rounded-lg font-medium transition-all"
                >
                  <ClipboardIcon />
                  Paste
                </button>
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 text-[13px] rounded-lg font-medium transition-all"
                >
                  Copy
                </button>
                {state?.path && (
                  <button
                    onClick={handleSave}
                    className="px-3 py-1.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-[13px] rounded-lg font-medium transition-all"
                  >
                    Save
                  </button>
                )}
                <button
                  onClick={handleClear}
                  className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-600 hover:text-zinc-400 text-[13px] rounded-lg font-medium transition-all"
                >
                  Clear
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-2.5 rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30">
            <div className="text-zinc-600">
              <UploadIcon />
            </div>
            <p className="text-[13px] font-medium text-zinc-500">Drop an SVG file</p>
            <p className="text-xs text-zinc-700">Optimizes with SVGO</p>
            <button
              onClick={async () => {
                const text = await readText();
                if (/<svg[\s>]/i.test(text)) handlePasteSvg(text);
                else showToast("No SVG in clipboard");
              }}
              className="mt-1 flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 text-[13px] rounded-lg font-medium transition-all"
            >
              <ClipboardIcon />
              Paste SVG <span className="text-zinc-600 font-normal">⌘V</span>
            </button>
          </div>
        )}
      </DropZone>

      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-zinc-900 border border-zinc-800 text-zinc-300 px-4 py-2 rounded-lg text-[13px] shadow-2xl pointer-events-none animate-toast">
          {toast}
        </div>
      )}
    </div>
  );
}
