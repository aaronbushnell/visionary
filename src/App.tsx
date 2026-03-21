import { useState } from "react";
import { TabBar } from "./components/TabBar";
import { SvgTab } from "./components/svg/SvgTab";
import { CompressTab } from "./components/compress/CompressTab";
import { TabId } from "./types";

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>("compress");

  return (
    <div className="flex flex-col h-screen bg-neutral-950 text-white select-none overflow-hidden">
      {/* Title bar drag region — leaves room for traffic lights (~70px) */}
      <div
        data-tauri-drag-region
        className="h-11 shrink-0 flex items-end pb-0 pl-20"
      >
        <TabBar active={activeTab} onChange={setActiveTab} />
      </div>

      {/* Tab content */}
      <div className="flex-1 flex flex-col min-h-0">
        {activeTab === "svg" && <SvgTab />}
        {activeTab === "compress" && <CompressTab />}
      </div>
    </div>
  );
}
