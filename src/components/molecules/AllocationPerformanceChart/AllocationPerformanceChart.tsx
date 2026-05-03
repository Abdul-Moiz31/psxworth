"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import dynamic from "next/dynamic";
import { useMemo, useRef, useState } from "react";
import type { ViewMode } from "../AllocationPerformanceHeader/types";
import Legend from "./Legend";
import TopRightQuadrantOverlay from "./TopRightQuadrantOverlay";
import "./apexcharts.css";
import { computeEqualQuadrantBounds, generateSeriesColors, getLabelsIconSvg, repositionDataLabels } from "./helpers";
import type { ScatterPoint } from "./types";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export interface AllocationPerformanceChartProps {
  points: ScatterPoint[];
  viewMode: ViewMode;
}

export const AllocationPerformanceChart = ({ points }: AllocationPerformanceChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [overlayToken, setOverlayToken] = useState(0);
  const [showDataLabels, setShowDataLabels] = useState(true);
  const [isTouchDevice] = useState(() => {
    // Detect touch/coarse pointer devices to tailor interactions for mobile/tablet
    if (typeof window === "undefined") return false;
    const coarse = typeof window.matchMedia === "function" && window.matchMedia("(pointer: coarse)").matches;
    const touchCapable = "ontouchstart" in window || (navigator as any)?.maxTouchPoints > 0 || coarse;
    return !!touchCapable;
  });

  const seriesColors = useMemo(() => generateSeriesColors(points), [points]);

  // Axis range based on the range of points.
  const { yMin, yMax, xMin, xMax, centerX, centerY } = useMemo(() => computeEqualQuadrantBounds(points), [points]);

  const options: ApexCharts.ApexOptions = useMemo(
    () => ({
      chart: {
        background: "#0f172a",
        toolbar: {
          show: true,
          offsetX: 3,
          offsetY: 0,
          autoSelected: isTouchDevice ? "pan" : "zoom",
          tools: {
            download: true,
            selection: !isTouchDevice,
            zoom: !isTouchDevice,
            zoomin: !isTouchDevice,
            zoomout: !isTouchDevice,
            pan: false,
            reset: true,
            // Add a custom toolbar icon to toggle data labels on the chart
            customIcons: [
              {
                icon: getLabelsIconSvg(showDataLabels),
                index: -1, // place at the end of the toolbar
                title: "Toggle labels",
                class: "apexcharts-custom-icon toggle-labels",
                click: () => {
                  setShowDataLabels((v) => !v);
                },
              },
            ],
          },
          export: {
            // Improve PNG quality by scaling raster export on hiDPI screens
            scale: typeof window !== "undefined" ? Math.max(3, Math.ceil(window.devicePixelRatio)) : 3,
          },
          animations: {
            enabled: true,
            easing: "easeinout",
            speed: 450,
            animateGradually: { enabled: true, delay: 75 },
            dynamicAnimation: { enabled: true, speed: 350 },
          },
        },
        // Enable zoom and disable wheel/trackpad zoom while keeping toolbar zoom controls
        zoom: {
          enabled: !isTouchDevice,
          type: "xy",
          allowMouseWheelZoom: false,
          zoomedArea: {
            fill: { color: "#90CAF9", opacity: 0.2 },
            stroke: { color: "#0D47A1", opacity: 0.4, width: 1 },
          },
        },
        events: {
          mounted: () => {
            // Delay repositioning to ensure chart is fully rendered
            setTimeout(() => {
              repositionDataLabels();
              setOverlayToken((t) => t + 1);
            }, 100);
          },
          updated: () => {
            setTimeout(() => {
              repositionDataLabels();
              setOverlayToken((t) => t + 1);
            }, 100);
          },
        },
      },
      legend: { show: false },
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 450,
        animateGradually: { enabled: true, delay: 75 },
        dynamicAnimation: { enabled: true, speed: 350 },
      },
      colors: seriesColors,
      grid: {
        borderColor: "#334155",
        // Add more grid lines for better quadrant visualization
        xaxis: {
          lines: {
            show: true,
          },
        },
        yaxis: {
          lines: {
            show: true,
          },
        },
      },
      annotations: {
        position: "back",
        xaxis: [
          {
            x: centerX,
            strokeDashArray: 3,
            borderColor: "#64748b",
            borderWidth: 2,
            label: {
              text: `${centerX.toFixed(0)}%`,
              style: { color: "#e2e8f0", background: "#1f2937", fontSize: "12px" },
            },
          },
        ],
        yaxis: [
          {
            y: centerY,
            strokeDashArray: 3,
            borderColor: "#64748b",
            borderWidth: 2,
            label: {
              text: `${centerY.toFixed(0)}%`,
              style: { color: "#e2e8f0", background: "#1f2937", fontSize: "12px" },
            },
          },
        ],
      },
      xaxis: {
        title: { text: "Allocation %", style: { color: "#cbd5e1" } },
        min: xMin,
        max: xMax,
        tickAmount: 8, // More ticks for better division visibility
        labels: {
          formatter: (v) => `${Number(v).toFixed(0)}%`,
          style: { colors: "#cbd5e1" },
        },
      },
      yaxis: {
        title: { text: "Total Return %", style: { color: "#cbd5e1" } },
        min: yMin,
        max: yMax,
        tickAmount: 8, // More ticks for better division visibility
        labels: {
          formatter: (v) => `${Number(v).toFixed(0)}%`,
          style: { colors: "#cbd5e1" },
        },
      },
      tooltip: {
        theme: "dark",
        custom: ({ seriesIndex, dataPointIndex, w }) => {
          const p = (w.config.series[seriesIndex] as any).data[dataPointIndex];
          const name = p.meta?.name ?? "";
          const x = Number(p.x) ?? 0;
          const y = Number(p.y) ?? 0;
          return `
            <div class="bg-slate-700 p-3 rounded-lg shadow-lg border border-slate-600">
              <div class="font-semibold text-gray-100 mb-1">${name}</div>
              <div class="text-gray-200">Allocation: ${x.toFixed(1)}%</div>
              <div class="text-gray-200">Return: ${y.toFixed(1)}%</div>
            </div>`;
        },
      },
      dataLabels: {
        enabled: showDataLabels,
        offsetY: -4, // Reduced from -8
        style: {
          colors: seriesColors,
          fontWeight: 600,
          fontSize: "11px",
          fontFamily: "system-ui, -apple-system, sans-serif",
        },
        formatter: (_val: number, opts: any) => {
          const p = opts.w.config.series[opts.seriesIndex].data[opts.dataPointIndex];
          const name = p?.meta?.name ?? "";
          // Truncate very long names
          return name.length > 15 ? name.substring(0, 15) + "..." : name;
        },
        background: {
          enabled: true,
          foreColor: "#f3f4f6",
          borderRadius: 3,
          padding: 2,
          opacity: 0.8,
        },
      },
      markers: {
        size: 8,
        strokeColors: "#0f172a",
        strokeWidth: 2,
        hover: { sizeOffset: 2 },
      },
      noData: {
        text: "No data available. Please add transactions to see the allocation and total return.",
        align: "center",
        style: { color: "#fff", fontSize: "16px" },
      },
    }),
    [yMax, yMin, xMin, xMax, centerX, centerY, seriesColors, showDataLabels, isTouchDevice]
  );

  const series = useMemo(() => {
    // Create a series per point to allow individual colors
    return points.map((p: ScatterPoint, idx: number) => ({
      name: p.name,
      color: seriesColors[idx % seriesColors.length],
      data: [
        {
          x: p.x,
          y: p.y,
          meta: { name: p.name },
        },
      ],
    }));
  }, [points, seriesColors]);

  return (
    <div className="relative w-full apex-toolbar-default isolate" ref={chartContainerRef}>
      <div className="mb-3 flex flex-col gap-2">
        <Legend points={points} seriesColors={seriesColors} />
        {/* Settings are moved into the chart toolbar (top-right) via a custom icon for a cleaner layout */}
        <div className="hidden" aria-hidden>
          <Label htmlFor="show-data-labels">Labels</Label>
          <Switch id="show-data-labels" checked={showDataLabels} onCheckedChange={setShowDataLabels} />
        </div>
      </div>
      <div style={{ height: "60vh", touchAction: "pan-x pan-y" }} className="relative">
        <Chart options={options} series={series as any} type="scatter" width="100%" height="100%" />
      </div>
      <TopRightQuadrantOverlay
        containerRef={chartContainerRef}
        xMin={xMin}
        xMax={xMax}
        yMin={yMin}
        yMax={yMax}
        centerX={centerX}
        centerY={centerY}
        notifyToken={overlayToken}
      />
    </div>
  );
};

export default AllocationPerformanceChart;
