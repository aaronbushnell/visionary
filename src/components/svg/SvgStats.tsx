interface SvgStatsProps {
  inputBytes: number;
  outputBytes: number;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function SvgStats({ inputBytes, outputBytes }: SvgStatsProps) {
  const savings = inputBytes - outputBytes;
  const pct = inputBytes > 0 ? Math.round((savings / inputBytes) * 100) : 0;

  return (
    <div className="flex items-center gap-2 text-[13px] tabular-nums">
      <span className="text-zinc-600">{formatBytes(inputBytes)}</span>
      <span className="text-zinc-800 text-xs">→</span>
      <span className="text-zinc-300 font-medium">{formatBytes(outputBytes)}</span>
      {pct > 0 && (
        <span className="text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded text-[11px] font-medium">
          −{pct}%
        </span>
      )}
    </div>
  );
}
