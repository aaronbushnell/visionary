// svgo is bundled by Vite for the browser context
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore – svgo ships CJS types; Vite resolves the ESM bundle correctly
import { optimize } from "svgo";

export interface SvgoResult {
  data: string;
  inputBytes: number;
  outputBytes: number;
}

export function runSvgo(
  svgString: string,
  useCurrentColor: boolean
): SvgoResult {
  const inputBytes = new TextEncoder().encode(svgString).length;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const plugins: any[] = [
    {
      name: "preset-default",
      params: {
        overrides: {
          removeViewBox: false,
          cleanupNumericValues: { floatPrecision: 2 },
          convertPathData: { floatPrecision: 2 },
          convertTransform: { floatPrecision: 3 },
          removeDesc: { removeAny: false },
        },
      },
    },
    { name: "removeDimensions" },
  ];

  if (useCurrentColor) {
    plugins.push({
      name: "replaceColorsWithCurrentColor",
      fn: () => ({
        element: {
          enter(node: { attributes: Record<string, string> }) {
            const skip = new Set([
              "none",
              "inherit",
              "transparent",
              "currentColor",
            ]);
            for (const attr of ["fill", "stroke"] as const) {
              const val = node.attributes[attr];
              if (val && !skip.has(val)) {
                node.attributes[attr] = "currentColor";
              }
            }
          },
        },
      }),
    });
  }

  const result = optimize(svgString, {
    multipass: true,
    plugins,
  });

  const outputBytes = new TextEncoder().encode(result.data).length;

  return { data: result.data, inputBytes, outputBytes };
}
