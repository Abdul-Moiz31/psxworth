import { formatCurrency } from "@/utils/helpers/formatHelpers";
import { AllocationItem, AllocationFilters } from "./types";

const downloadIcon =
  '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>';

export const getToolbarConfig = (data: AllocationItem[]) => ({
  show: true,
  offsetX: 3,
  offsetY: 0,
  tools: {
    download: downloadIcon,
    selection: false,
    zoom: false,
    zoomin: false,
    zoomout: false,
    pan: false,
    reset: false,
  },
  export: {
    // Increase PNG export scale for higher-resolution raster exports.
    // Use device pixel ratio if available, with a sensible minimum.
    // SVG exports remain vector and crisp regardless of scale.
    scale: typeof window !== "undefined" ? Math.max(3, Math.ceil(window.devicePixelRatio)) : 3,
    csv: {
      filename: "allocation-chart",
      headerCategory: "Category",
      headerValue: "Percentage",
      columnDelimiter: ",",
      dataFormatter: (value: any, opts: any) => {
        const dataPoint = data[opts.dataPointIndex];
        return dataPoint ? `${dataPoint.percentage.toFixed(1)}%` : value;
      },
    },
    svg: { filename: "allocation-chart" },
    png: { filename: "allocation-chart" },
  },
});

export const getTooltipConfig = (data: AllocationItem[], viewMode: AllocationFilters["viewMode"]) => ({
  theme: "dark",
  custom: ({ dataPointIndex }: any) => {
    const item = data[dataPointIndex];
    return `
      <div class="bg-slate-700 p-3 rounded-lg shadow">
        <div class="font-medium text-gray-100">
          ${viewMode === "sectors" ? item.sectorName : item.name}
        </div>
        <div class="text-gray-200">
          ${item.percentage.toFixed(1)}%
        </div>
        <div class="text-gray-300 text-sm">
          ${formatCurrency(item.totalAmount)}
        </div>
      </div>
    `;
  },
});

export const getDataLabelsConfig = (data: AllocationItem[], viewMode: AllocationFilters["viewMode"]) => ({
  enabled: true,
  style: {
    fontSize: "12px",
    colors: ["#fff"],
  },
  formatter: (text: string) => {
    const percentage = data
      .find((item) => (viewMode === "sectors" ? item.sectorName : item.name) === text)
      ?.percentage.toFixed(1);
    return [text, `${percentage}%`];
  },
});
