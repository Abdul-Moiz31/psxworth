import { ApexOptions } from "apexcharts";
import { ReturnType, Scope } from "../shared/types";
import { ChartDataPoint } from "./utils";
import { formatDate, formatReturn, formatCurrency } from "./utils";

interface ChartConfigParams {
  returnType: ReturnType;
  scope: Scope;
  error: Error | null;
  chartData: ChartDataPoint[];
}

export function getHistoricalReturnsChartOptions({
  returnType,
  scope,
  error,
  chartData,
}: ChartConfigParams): ApexOptions {
  return {
    chart: {
      type: "line",
      background: "#0f172a",
      parentHeightOffset: 0,
      toolbar: {
        show: true,
        offsetX: 3,
        offsetY: 0,
        tools: {
          download: true,
          selection: false,
          zoom: false,
          zoomin: true,
          zoomout: true,
          pan: false,
          reset: false,
        },
        export: {
          scale: typeof window !== "undefined" ? Math.max(3, Math.ceil(window.devicePixelRatio)) : 3,
          width: 1000,
          csv: {
            filename: `historical-returns-${returnType}-${scope}`,
            headerCategory: "Date",
            headerValue: "Return (%)",
            columnDelimiter: ",",
          },
          svg: { filename: `historical-returns-${returnType}-${scope}` },
          png: { filename: `historical-returns-${returnType}-${scope}` },
        },
      },
      zoom: {
        enabled: true,
        type: "x",
      },
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    colors: ["#00e396"],
    dataLabels: {
      enabled: false,
    },
    grid: {
      borderColor: "#40475D",
    },
    xaxis: {
      type: "datetime",
      labels: {
        style: {
          colors: "#fff",
        },
        datetimeFormatter: {
          year: "yyyy",
          month: "MMM yyyy",
          day: "MMM d",
          hour: "HH:mm",
        },
      },
      title: {
        text: "Date",
        style: { color: "#fff" },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#fff",
        },
        formatter: (value: number) => `${value.toFixed(2)}%`,
      },
      title: {
        text: "Return (%)",
        style: { color: "#fff" },
      },
    },
    tooltip: {
      theme: "dark",
      x: {
        formatter: (value: number) => {
          const point = chartData.find((d) => d.x === value);
          return point ? formatDate(point.date) : "";
        },
      },
      y: {
        formatter: (value: number) => formatReturn(value),
      },
      custom: ({ dataPointIndex }) => {
        const point = chartData[dataPointIndex];
        if (!point) return "";

        return `
          <div class="p-2">
            <div class="text-sm font-semibold">${formatDate(point.date)}</div>
            <div class="text-sm">Return: ${formatReturn(point.y)}</div>
            <div class="text-sm">Value: ${formatCurrency(point.value)}</div>
          </div>
        `;
      },
    },
    markers: {
      size: 0,
      hover: {
        size: 0,
      },
    },
    noData: {
      text: error ? "Error loading data" : "No data available",
      align: "center",
      verticalAlign: "middle",
      style: {
        color: "#fff",
        fontSize: "16px",
      },
    },
  };
}
