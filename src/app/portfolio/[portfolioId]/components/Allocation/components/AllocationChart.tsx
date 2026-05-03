import dynamic from "next/dynamic";
import { useMemo } from "react";
import "../utils/apexcharts.css";
import { getDataLabelsConfig, getToolbarConfig, getTooltipConfig } from "../utils/chartConfig";
import { COLORS } from "../utils/constants";
import { AllocationFilters, AllocationItem } from "../utils/types";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface AllocationChartProps {
  data: AllocationItem[];
  viewMode: AllocationFilters["viewMode"];
  compact?: boolean;
}

export const AllocationChart = ({ data, viewMode, compact = false }: AllocationChartProps) => {
  const chartOptions: ApexCharts.ApexOptions = useMemo(
    () => ({
      chart: {
        toolbar: getToolbarConfig(data),
      },
      colors: COLORS,
      plotOptions: {
        treemap: {
          distributed: true,
          enableShades: false,
        },
      },
      legend: { show: false },
      tooltip: getTooltipConfig(data, viewMode),
      dataLabels: getDataLabelsConfig(data, viewMode),
      noData: {
        text: "No data available",
        align: "center",
        style: {
          color: "#fff",
          fontSize: "16px",
        },
      },
    }),
    [data, viewMode]
  );

  const chartSeries = useMemo(
    () => [
      {
        data: data.map((item) => ({
          x: viewMode === "sectors" ? item.sectorName : item.name,
          y: item.totalAmount,
        })),
      },
    ],
    [data, viewMode]
  );

  return (
    <div
      className={compact ? "relative treemap-scope w-full" : "relative aspect-square treemap-scope w-full"}
      style={compact ? { height: "70svh" } : undefined}
    >
      <Chart options={chartOptions} series={chartSeries} type="treemap" width="100%" height="100%" />
    </div>
  );
};
