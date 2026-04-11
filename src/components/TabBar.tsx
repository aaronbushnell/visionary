import { TabId } from "../types";

interface TabBarProps {
  active: TabId;
  onChange: (tab: TabId) => void;
}

function CompressIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2.5" y="4" width="15" height="12" rx="2.5" />
      <path d="M2.5 13l3.5-4 3 3 3.5-4.5 5.5 7" />
      <circle cx="14" cy="7.5" r="1.2" fill="currentColor" strokeWidth="0" />
    </svg>
  );
}

function SvgIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M4.5 15.5 C 4.5 8, 15.5 12, 15.5 4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <rect x="2.5" y="13.5" width="3.5" height="3.5" rx="0.75" fill="currentColor" />
      <rect x="14" y="2.5" width="3.5" height="3.5" rx="0.75" fill="currentColor" />
    </svg>
  );
}

function AboutIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    >
      <circle cx="10" cy="10" r="8" />
      <circle cx="10" cy="6.5" r="0.9" fill="currentColor" strokeWidth="0" />
      <line x1="10" y1="9.5" x2="10" y2="14.5" />
    </svg>
  );
}

const TABS: { id: TabId; label: string; Icon: () => JSX.Element }[] = [
  { id: "svg", label: "SVG", Icon: SvgIcon },
  { id: "compress", label: "Compress", Icon: CompressIcon },
  { id: "about", label: "About", Icon: AboutIcon },
];

export function TabBar({ active, onChange }: TabBarProps) {
  return (
    <nav className="flex items-center gap-1">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex flex-col items-center gap-[5px] w-[88px] py-2 rounded-xl ${
            active === tab.id
              ? "bg-zinc-800 text-zinc-100 shadow-[0_1px_4px_rgba(0,0,0,0.4)]"
              : "text-zinc-600"
          }`}
        >
          <tab.Icon />
          <span className="text-[11px] leading-none font-medium">
            {tab.label}
          </span>
        </button>
      ))}
    </nav>
  );
}
