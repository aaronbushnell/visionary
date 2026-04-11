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
        className="flex-1 rounded-lg border border-neutral-800 flex items-center justify-center p-4 overflow-hidden"
        style={{
          minHeight: 0,
          backgroundColor: "#3a3a46",
          backgroundImage:
            "linear-gradient(45deg, #25252f 25%, transparent 25%), linear-gradient(-45deg, #25252f 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #25252f 75%), linear-gradient(-45deg, transparent 75%, #25252f 75%)",
          backgroundSize: "16px 16px",
          backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
        }}
      >
        <div
          className="w-full h-full flex items-center justify-center [&_svg]:max-w-full [&_svg]:max-h-full [&_svg]:w-auto [&_svg]:h-auto"
          dangerouslySetInnerHTML={{ __html: svgString }}
        />
      </div>
    </div>
  );
}
