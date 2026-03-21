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
  { name: "serde", version: "1.0.228" },
];

function AppLogo() {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
      <defs>
        <radialGradient id="lBg" cx="36" cy="28" r="50" gradientUnits="userSpaceOnUse">
          <stop offset="0%"  stopColor="#161228"/>
          <stop offset="100%" stopColor="#06040A"/>
        </radialGradient>
        <radialGradient id="lBloom" cx="36" cy="36" r="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%"  stopColor="#7B6EF5" stopOpacity="0.20"/>
          <stop offset="100%" stopColor="#7B6EF5" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="lIris" cx="31" cy="30" r="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%"  stopColor="#E2DAFF"/>
          <stop offset="20%" stopColor="#9180F7"/>
          <stop offset="58%" stopColor="#5846CC"/>
          <stop offset="100%" stopColor="#110A3C"/>
        </radialGradient>
        <radialGradient id="lPupil" cx="35" cy="35" r="9" gradientUnits="userSpaceOnUse">
          <stop offset="0%"  stopColor="#1E1445"/>
          <stop offset="100%" stopColor="#030210"/>
        </radialGradient>
        <linearGradient id="lSheen" x1="18" y1="15" x2="44" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%"  stopColor="white" stopOpacity="0.65"/>
          <stop offset="35%" stopColor="white" stopOpacity="0.16"/>
          <stop offset="100%" stopColor="white" stopOpacity="0"/>
        </linearGradient>
        <clipPath id="lClip">
          <circle cx="36" cy="36" r="21.5"/>
        </clipPath>
      </defs>

      {/* Squircle background */}
      <rect width="72" height="72" rx="18" fill="url(#lBg)"/>
      {/* Bloom */}
      <rect width="72" height="72" rx="18" fill="url(#lBloom)"/>

      {/* Shadow ellipse */}
      <ellipse cx="37" cy="39" rx="21" ry="15" fill="#2E1C90" fillOpacity="0.40"/>

      {/* Iris */}
      <circle cx="36" cy="36" r="21.5" fill="url(#lIris)"/>

      {/* Limbal ring */}
      <circle cx="36" cy="36" r="10" fill="none" stroke="#080420" strokeWidth="1" strokeOpacity="0.80" clipPath="url(#lClip)"/>
      {/* Pupil */}
      <circle cx="36" cy="36" r="9" fill="url(#lPupil)" clipPath="url(#lClip)"/>

      {/* Glass sheen sweep */}
      <ellipse cx="28" cy="26" rx="17" ry="11" fill="url(#lSheen)" transform="rotate(-22 28 26)" clipPath="url(#lClip)"/>
      {/* Soft specular */}
      <ellipse cx="26" cy="24" rx="7" ry="4.5" fill="white" opacity="0.26" transform="rotate(-15 26 24)" clipPath="url(#lClip)"/>
      {/* Pin-point specular */}
      <circle cx="25" cy="23" r="3" fill="white" opacity="0.75" clipPath="url(#lClip)"/>
      <circle cx="25" cy="23" r="1" fill="white" opacity="1.0"  clipPath="url(#lClip)"/>

      {/* Edge ring */}
      <circle cx="36" cy="36" r="21.5" fill="none" stroke="white" strokeWidth="0.75" strokeOpacity="0.12"/>
    </svg>
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
        Version 0.1.0
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
