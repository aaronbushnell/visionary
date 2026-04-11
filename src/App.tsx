import { useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { TabBar } from "./components/TabBar";
import { SvgTab } from "./components/svg/SvgTab";
import { CompressTab } from "./components/compress/CompressTab";
import { AboutTab } from "./components/about/AboutTab";
import { TabId } from "./types";

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>("svg");

  const handleTitlebarMouseDown = (e: React.MouseEvent) => {
    if (!(e.target as HTMLElement).closest("button")) {
      e.preventDefault();
      getCurrentWindow().startDragging();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-white select-none overflow-hidden">
      {/* Title bar */}
      <div
        className="relative h-[62px] shrink-0 border-b border-zinc-900"
        onMouseDown={handleTitlebarMouseDown}
      >
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="pointer-events-auto">
            <TabBar active={activeTab} onChange={setActiveTab} />
          </div>
        </div>
      </div>

      {/* Tab content — always mounted to preserve state and in-flight processing */}
      <div className={`flex-1 flex flex-col min-h-0 ${activeTab === "compress" ? "" : "hidden"}`}>
        <CompressTab />
      </div>
      <div className={`flex-1 flex flex-col min-h-0 ${activeTab === "svg" ? "" : "hidden"}`}>
        <SvgTab />
      </div>
      <div className={`flex-1 flex flex-col min-h-0 ${activeTab === "about" ? "" : "hidden"}`}>
        <AboutTab />
      </div>
    </div>
  );
}
