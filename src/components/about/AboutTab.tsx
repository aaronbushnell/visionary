const FRONTEND_LIBS = [
  { name: "React", version: "18.3.1" },
  { name: "Tauri", version: "2.10.1" },
  { name: "SVGO", version: "3.3.3" },
  { name: "Tailwind CSS", version: "3.4.19" },
  { name: "TypeScript", version: "5.9.3" },
  { name: "Vite", version: "5.4.21" },
];

const RUST_LIBS = [
  { name: "Tauri", version: "2.10.3" },
  { name: "image", version: "0.25.10" },
  { name: "webp", version: "0.3.1" },
  { name: "ravif", version: "0.13.0" },
  { name: "serde", version: "1.0.228" },
  { name: "tauri-plugin-clipboard-manager", version: "2.3.2" },
];

function AppLogo() {
  return (
    <img
      src="/icon.png"
      width={72}
      height={72}
      alt="Visionary"
      className="rounded-[18px]"
      draggable={false}
    />
  );
}

function LibRow({ name, version }: { name: string; version: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2 py-[5px] border-b border-zinc-900 last:border-0">
      <span className="text-[13px] text-zinc-400">{name}</span>
      <span className="text-[12px] text-zinc-600 tabular-nums">{version}</span>
    </div>
  );
}

export function AboutTab() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 select-text">
      {/* Logo + identity */}
      <AppLogo />
      <h1 className="mt-4 text-[18px] font-semibold text-zinc-100 tracking-tight">
        Visionary
      </h1>
      <p className="mt-1 text-[13px] text-zinc-500 tabular-nums">
        Version 0.2.3
      </p>
      <p className="mt-1 text-[12px] text-zinc-700">
        Image &amp; SVG tools for web developers
      </p>

      {/* Divider */}
      <div className="w-full max-w-xs mt-8 border-t border-zinc-900" />

      {/* Libraries */}
      <div className="mt-6 w-full max-w-xs">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-600 mb-4">
          Built with
        </p>
        <div className="grid grid-cols-2 gap-x-8">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-zinc-700 mb-1">
              Frontend
            </p>
            {FRONTEND_LIBS.map((lib) => (
              <LibRow key={lib.name} {...lib} />
            ))}
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-zinc-700 mb-1">
              Rust
            </p>
            {RUST_LIBS.map((lib) => (
              <LibRow key={lib.name} {...lib} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
