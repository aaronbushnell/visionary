interface ResizeDimensionInputProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function ResizeDimensionInput({
  value,
  onChange,
  disabled,
}: ResizeDimensionInputProps) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-neutral-400">Max dimension</label>
      <input
        type="number"
        value={value}
        min={1}
        max={16000}
        disabled={disabled}
        onChange={(e) => {
          const n = parseInt(e.target.value, 10);
          if (!isNaN(n) && n > 0) onChange(n);
        }}
        className="w-24 px-2 py-1 bg-neutral-800 border border-neutral-700 text-white text-sm rounded-lg text-right focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
      />
      <span className="text-sm text-neutral-500">px</span>
    </div>
  );
}
