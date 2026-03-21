import { TabId } from "../types";

interface TabBarProps {
  active: TabId;
  onChange: (tab: TabId) => void;
}

const TABS: { id: TabId; label: string }[] = [
  { id: "compress", label: "Compress" },
  { id: "svg", label: "SVG" },
];

export function TabBar({ active, onChange }: TabBarProps) {
  return (
    <div className="flex items-center justify-center gap-1 py-2">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-4 py-1 rounded-full text-sm font-medium transition-colors ${
            active === tab.id
              ? "bg-neutral-700 text-white"
              : "text-neutral-400 hover:text-neutral-200"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
