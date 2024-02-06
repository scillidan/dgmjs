import type { Diagram } from "./shapes";
import { Canvas } from "./graphics/graphics";
import * as geometry from "./graphics/geometry";
import fileSaverPkg from "file-saver";
import { colors } from "./colors";
import { Context } from "svgcanvas";
const { saveAs } = fileSaverPkg;

export const DEFAULT_MARGIN = 10;

export type ExportImageFormat = "image/png" | "image/svg+xml";

export type ExportImageOptions = {
  scale: number;
  dark: boolean;
  fillBackground: boolean;
  format: ExportImageFormat;
};

/**
 * Create and return a new canvas element with diagram rendered
 */
function getImageCanvas(diagram: Diagram, options: ExportImageOptions) {
  const { scale, dark, fillBackground } = options;
  const theme = dark ? "dark" : "light";
  const colorVariables = colors[theme];

  // make a new canvas element for making image data
  const canvasElement = document.createElement("canvas");
  const canvas = new Canvas(
    canvasElement.getContext("2d") as CanvasRenderingContext2D,
    scale
  );
  let boundingBox = diagram.getDiagramBoundingBox(canvas);

  // initialize new canvas
  boundingBox = geometry.expandRect(boundingBox, DEFAULT_MARGIN);
  const w = geometry.width(boundingBox);
  const h = geometry.height(boundingBox);
  canvas.origin = [-boundingBox[0][0], -boundingBox[0][1]];
  canvas.ratio = scale;
  canvas.scale = 1;
  canvas.colorVariables = colorVariables;
  canvasElement.width = w * canvas.ratio;
  canvasElement.height = h * canvas.ratio;
  canvasElement.style.width = w + "px";
  canvasElement.style.height = h + "px";

  // fill background
  if (fillBackground) {
    canvas.context.fillStyle = canvas.resolveColor("$background");
    canvas.context.fillRect(0, 0, canvasElement.width, canvasElement.height);
  }

  // draw diagram to the new canvas
  diagram.render(canvas);
  return canvasElement;
}

/**
 * Get Base64-encoded image data of diagram
 */
export async function getImageDataUrl(
  diagram: Diagram,
  options: Partial<ExportImageOptions>
): Promise<string> {
  const canvas = getImageCanvas(diagram, {
    scale: 1,
    dark: false,
    fillBackground: true,
    format: "image/png",
    ...options,
  });
  return canvas.toDataURL(options.format);
}

/**
 * Get Blob image data of diagram
 */
export async function getImageBlob(
  diagram: Diagram,
  options: Partial<ExportImageOptions>
): Promise<Blob | null> {
  const canvas = getImageCanvas(diagram, {
    scale: 1,
    dark: false,
    fillBackground: true,
    format: "image/png",
    ...options,
  });
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, options.format);
  });
}

/**
 * Get SVG image data of diagram
 */
export async function getSVGImageData(
  canvas: Canvas,
  diagram: Diagram,
  options: Partial<ExportImageOptions>,
  styleInSVG?: string
): Promise<string> {
  const { scale, dark, fillBackground, margin } = {
    scale: 1,
    dark: false,
    fillBackground: true,
    margin: DEFAULT_MARGIN,
    ...options,
  };
  const theme = dark ? "dark" : "light";
  const colorVariables = colors[theme];

  // Make a new SVG canvas for making SVG image data
  const boundingBox = geometry.expandRect(
    diagram.getDiagramBoundingBox(canvas),
    margin
  );
  const w = geometry.width(boundingBox);
  const h = geometry.height(boundingBox);
  const ctx = new Context(w * scale, h * scale);
  const svgCanvas = new Canvas(ctx, 1);

  // Initialize new SVG Canvas
  svgCanvas.origin = [-boundingBox[0][0], -boundingBox[0][1]];
  svgCanvas.ratio = scale;
  svgCanvas.scale = 1;
  svgCanvas.colorVariables = colorVariables;
  const svgCanvasWidth = w * scale;
  const svgCanvasHeight = h * scale;

  // Fill background
  if (fillBackground) {
    svgCanvas.context.fillStyle = svgCanvas.resolveColor("$background");
    svgCanvas.context.fillRect(0, 0, svgCanvasWidth, svgCanvasHeight);
  }

  // Draw diagram to the new canvas
  diagram.render(svgCanvas);

  // TODO: add fonts in defs (temporal impls)
  const svg: SVGSVGElement = ctx.getSvg();
  const defs = svg.getElementsByTagName("defs");
  if (styleInSVG && defs.length > 0) {
    const styleTag = document.createElement("style");
    styleTag.setAttribute("type", "text/css");
    styleTag.appendChild(document.createTextNode(styleInSVG));
    defs.item(0)?.appendChild(styleTag);
  }

  // Return the SVG data
  const data = ctx.getSerializedSvg(true);

  return data;
}

/**
 * Export diagram image as a file
 */
export async function exportImageAsFile(
  canvas: Canvas,
  diagram: Diagram,
  fileName: string,
  options: Partial<ExportImageOptions>,
  styleInSVG?: string
) {
  switch (options.format) {
    case "image/png": {
      const data = await getImageBlob(diagram, options);
      if (data) {
        saveAs(data, fileName);
      }
      break;
    }
    case "image/svg+xml": {
      const data = await getSVGImageData(canvas, diagram, options, styleInSVG);
      if (data) {
        const blob = new Blob([data], { type: "image/svg+xml" });
        saveAs(blob, fileName);
      }
      break;
    }
  }
}

/**
 * Copy diagram image to clipboard
 */
export async function copyToClipboard(
  canvas: Canvas,
  diagram: Diagram,
  options: Partial<ExportImageOptions>
) {
  switch (options.format) {
    case "image/png": {
      const data = await getImageBlob(diagram, options);
      if (data) {
        navigator.clipboard.write([
          new ClipboardItem({
            "image/png": data,
          }),
        ]);
      }
      break;
    }
    case "image/svg+xml": {
      // Copy SVG to clipboard is not support by browser
      break;
    }
  }
}
