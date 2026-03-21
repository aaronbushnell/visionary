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
    <div className="flex items-center gap-3 text-sm">
      <span className="text-neutral-400">{formatBytes(inputBytes)}</span>
      <span className="text-neutral-600">→</span>
      <span className="text-white font-medium">{formatBytes(outputBytes)}</span>
      {pct > 0 && (
        <span className="text-green-400 font-medium">(−{pct}%)</span>
      )}
    </div>
  );
}
