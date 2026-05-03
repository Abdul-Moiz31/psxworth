import { coerceToDatePreservingLocalDate } from "@/types/localDate";

export const formatCurrency = (value: number): string => {
  const rounded = Math.round(value * 100) / 100;

  return new Intl.NumberFormat("en-PK", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rounded);
};

export const formatDate = (date: Date | string | number): string => {
  const dateValue = coerceToDatePreservingLocalDate(date);

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(dateValue);
};

export const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value / 100);
};

export const formatValueWithPercentage = (value: number, percentage: number): string => {
  return `${formatCurrency(value)} (${formatPercentage(percentage)})`;
};
