import { ToggleProps } from "@/components/ui/toggle";
import { StockDetailedPerformance } from "@/interfaces";
import { StockInfo } from "@/types";

export interface AllocationProps {
  stocks: StockDetailedPerformance[];
  stocksInfo?: StockInfo[];
}

export interface AllocationItem {
  name?: string;
  totalAmount: number;
  percentage: number;
  sectorName?: string;
  stocks?: StockDetailedPerformance[];
}

export interface AllocationFilters {
  view: "cost" | "value";
  viewMode: "sectors" | "stocks";
  etfExpanded: boolean;
}
export interface AllocationControlsProps {
  totalAmount: number;
}

export interface AllocationToggleConfig extends ToggleProps {
  key: string;
  label: string;
}

export interface SectorAllocation {
  sectorName: string;
  totalAmount: number;
  percentage: number;
  stocks: StockDetailedPerformance[];
}

export type EtfHoldingWithPrice = {
  holdingSymbol: string;
  shares: number;
  price: number | null;
};

export type EtfDetailsWithPrice = {
  symbol: string;
  cashComponent?: number | null;
  cashComponentPercent?: number | null;
  asOfDate?: string | null;
  sourceUrl?: string;
  holdings: EtfHoldingWithPrice[];
  portfolioId?: number;
  userId?: string;
};

export type AggregatedEtfCash = {
  totalValue: number;
  totalCost: number;
  meta: {
    portfolioId?: number;
    userId?: string;
    createdAt?: Date;
    updatedAt?: Date;
  } | null;
};
