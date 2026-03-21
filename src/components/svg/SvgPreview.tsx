interface SvgPreviewProps {
  svgString: string;
  label: string;
}

export function SvgPreview({ svgString, label }: SvgPreviewProps) {
  return (
    <div className="flex flex-col flex-1 min-w-0 gap-2">
      <div className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
        {label}
      </div>
      <div
        className="flex-1 bg-neutral-900 rounded-lg border border-neutral-800 flex items-center justify-center p-4 overflow-hidden"
        style={{ minHeight: 0 }}
      >
        <div
          className="w-full h-full flex items-center justify-center [&_svg]:max-w-full [&_svg]:max-h-full [&_svg]:w-auto [&_svg]:h-auto"
          dangerouslySetInnerHTML={{ __html: svgString }}
        />
      </div>
    </div>
  );
}
