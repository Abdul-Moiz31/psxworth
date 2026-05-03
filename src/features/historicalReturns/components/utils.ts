import { format } from "date-fns";
import { HistoricalReturnsData, DateRange } from "../shared/types";

/**
 * Formats a percentage value for display
 */
export function formatReturn(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

/**
 * Formats currency value for display (PKR - no currency symbol, no decimals)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Formats date for display in tooltips
 */
export function formatDate(date: Date): string {
  return format(date, "MMM d, yyyy");
}

/**
 * Chart data point type for ApexCharts
 */
export interface ChartDataPoint {
  x: number;
  y: number;
  value: number;
  date: Date;
}

/**
 * Prepares data for ApexCharts
 */
export function prepareChartData(data: HistoricalReturnsData[]): ChartDataPoint[] {
  return data.map((point) => ({
    x: point.date.getTime(),
    y: point.return,
    value: point.portfolioValue,
    date: point.date,
  }));
}

/**
 * Gets chart color based on return value
 */
export function getReturnColor(returnValue: number): string {
  if (returnValue > 0) {
    return "#00e396"; // Green for positive returns
  } else if (returnValue < 0) {
    return "#ff4560"; // Red for negative returns
  }
  return "#8884d8"; // Neutral color
}

/**
 * Gets the default date range for historical returns (last 30 days)
 */
export function getDefaultDateRange(earliestDate?: Date | string | null): DateRange {
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);

  if (earliestDate) {
    const parsedEarliestDate = new Date(earliestDate);
    if (!Number.isNaN(parsedEarliestDate.getTime())) {
      parsedEarliestDate.setHours(0, 0, 0, 0);

      if (parsedEarliestDate.getTime() <= endDate.getTime()) {
        return { startDate: parsedEarliestDate, endDate };
      }
    }
  }

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);
  startDate.setHours(0, 0, 0, 0);
  return { startDate, endDate };
}
