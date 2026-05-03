import type { ScatterPoint } from "./types";

export interface QuadrantBounds {
  yMin: number;
  yMax: number;
  xMin: number;
  xMax: number;
  centerX: number;
  centerY: number;
}

export function generateSeriesColors(points: ScatterPoint[]): string[] {
  const palette = [
    "#e74c3c",
    "#3498db",
    "#2ecc71",
    "#f39c12",
    "#9b59b6",
    "#1abc9c",
    "#e67e22",
    "#f1c40f",
    "#e91e63",
    "#00bcd4",
    "#4caf50",
    "#ff9800",
    "#673ab7",
    "#795548",
    "#ffeb3b",
    "#ff5722",
    "#8bc34a",
    "#9c27b0",
    "#009688",
    "#ffc107",
    "#3f51b5",
    "#cddc39",
    "#ff6b6b",
    "#4ecdc4",
    "#45b7d1",
    "#96ceb4",
    "#feca57",
    "#ff7675",
  ];

  return points.map((_, idx) => palette[idx % palette.length]);
}

export function computeEqualQuadrantBounds(points: ScatterPoint[]): QuadrantBounds {
  if (!points || points.length === 0) {
    return { yMin: 0, yMax: 100, xMin: 0, xMax: 100, centerX: 50, centerY: 50 };
  }

  const minY = Math.min(...points.map((p) => p.y), 0);
  const maxY = Math.max(...points.map((p) => p.y), 0);
  const minX = Math.min(...points.map((p) => p.x), 0);
  const maxX = Math.max(...points.map((p) => p.x), 0);

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  const xRange = Math.max(Math.abs(maxX - centerX), Math.abs(centerX - minX));
  const yRange = Math.max(Math.abs(maxY - centerY), Math.abs(centerY - minY));

  const paddedXRange = Math.ceil((xRange + 3) / 5) * 5;
  const paddedYRange = Math.ceil((yRange + 5) / 5) * 5;

  return {
    yMin: centerY - paddedYRange,
    yMax: centerY + paddedYRange,
    xMin: centerX - paddedXRange,
    xMax: centerX + paddedXRange,
    centerX,
    centerY,
  };
}

// Reposition ApexCharts data labels to reduce overlap
export function repositionDataLabels(): void {
  try {
    const labelTexts = Array.from(document.querySelectorAll<SVGTextElement>(".apexcharts-datalabels text"));
    if (labelTexts.length === 0) return;

    const chartSvg = document.querySelector(".apexcharts-svg");
    const chartRect = chartSvg?.getBoundingClientRect();
    if (!chartRect) return;

    const labelInfo = labelTexts
      .map((textEl) => {
        const parentG = textEl.parentElement as SVGGElement | null;
        if (!parentG) return null;

        const transform = parentG.getAttribute("transform") || "";
        const match = /translate\(([-\d.]+)[ ,]([-\d.]+)\)/.exec(transform);
        const baseX = match ? parseFloat(match[1]) : 0;
        const baseY = match ? parseFloat(match[2]) : 0;

        return {
          element: textEl,
          parentG,
          baseX,
          baseY,
          bbox: textEl.getBoundingClientRect(),
          text: textEl.textContent || "",
        };
      })
      .filter(Boolean) as Array<{
      element: SVGTextElement;
      parentG: SVGGElement;
      baseX: number;
      baseY: number;
      bbox: DOMRect;
      text: string;
    }>;

    labelInfo.sort((a, b) => (b?.text.length || 0) - (a?.text.length || 0));

    const placedBoxes: DOMRect[] = [];

    for (const info of labelInfo) {
      const { element, parentG, baseX, baseY } = info;

      const candidateOffsets: Array<[number, number]> = [
        [0, -8],
        [8, -4],
        [8, 0],
        [8, 4],
        [0, 8],
        [-8, 4],
        [-8, 0],
        [-8, -4],
        [0, -12],
        [12, 0],
        [0, 12],
        [-12, 0],
        [10, -8],
        [-10, -8],
        [10, 8],
        [-10, 8],
      ];

      const overlaps = (box: DOMRect) =>
        placedBoxes.some(
          (placedBox) =>
            !(
              box.right + 5 < placedBox.left ||
              box.left - 5 > placedBox.right ||
              box.bottom + 3 < placedBox.top ||
              box.top - 3 > placedBox.bottom
            )
        );

      const isWithinBounds = (box: DOMRect) =>
        box.left >= chartRect.left + 10 &&
        box.right <= chartRect.right - 10 &&
        box.top >= chartRect.top + 10 &&
        box.bottom <= chartRect.bottom - 10;

      const currentBox = element.getBoundingClientRect();
      if (!overlaps(currentBox) && isWithinBounds(currentBox)) {
        placedBoxes.push(currentBox);
        continue;
      }

      let bestPosition: [number, number] | null = null;
      let bestScore = -1;

      for (const [dx, dy] of candidateOffsets) {
        parentG.setAttribute("transform", `translate(${baseX + dx}, ${baseY + dy})`);
        const testBox = element.getBoundingClientRect();
        if (!isWithinBounds(testBox)) continue;
        const hasOverlap = overlaps(testBox);
        if (!hasOverlap) {
          const distance = Math.sqrt(dx * dx + dy * dy);
          const score = 1000 - distance;
          if (score > bestScore) {
            bestScore = score;
            bestPosition = [baseX + dx, baseY + dy];
          }
        }
      }

      if (bestPosition) {
        parentG.setAttribute("transform", `translate(${bestPosition[0]}, ${bestPosition[1]})`);
        placedBoxes.push(element.getBoundingClientRect());
      } else {
        parentG.setAttribute("transform", `translate(${baseX}, ${baseY - 10})`);
        placedBoxes.push(element.getBoundingClientRect());
      }
    }
  } catch (error) {
    console.warn("Label repositioning failed:", error);
  }
}

// Toolbar icon for toggling data labels
export function getLabelsIconSvg(enabled: boolean): string {
  const accent = enabled ? "#60a5fa" : "#94a3b8"; // active vs inactive color
  const bg = enabled ? "rgba(96,165,250,0.15)" : "none"; // subtle active fill
  const overlay = enabled
    ? `<path d="M13 12.5l1.8 1.8 3.2-3.2" stroke="${accent}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`
    : `<path d="M8 16L16 8" stroke="${accent}" stroke-width="1.6" stroke-linecap="round"/>`;
  return `
    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 7a2 2 0 0 1 2-2h6a2 2 0 0 1 1.414.586l6 6a2 2 0 0 1 0 2.828l-4.586 4.586a2 2 0 0 1-2.828 0l-6-6A2 2 0 0 1 3 11V7z" fill="${bg}" stroke="${accent}" stroke-width="1.6"/>
      <circle cx="7.5" cy="9" r="1.2" fill="${accent}"/>
      ${overlay}
    </svg>
  `;
}
