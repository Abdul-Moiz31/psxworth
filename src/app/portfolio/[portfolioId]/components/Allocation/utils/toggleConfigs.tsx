import { ChevronDown, ChevronRight, Coins, LineChart, PieChart, ReceiptText } from "lucide-react";
import { AllocationFilters, AllocationToggleConfig } from "./types";

export const buildAllocationToggleConfigs = ({
  filters,
  setFilters,
}: {
  filters: AllocationFilters;
  setFilters: (filters: AllocationFilters) => void;
}): AllocationToggleConfig[] => [
  {
    key: "etfExpanded",
    label: "Show",
    checked: filters.etfExpanded,
    onChange: (checked: boolean) =>
      setFilters({
        ...filters,
        etfExpanded: checked,
        view: checked ? "value" : filters.view,
      }),
    uncheckedLabel: "ETF Collapsed",
    checkedLabel: "ETF Expanded",
    uncheckedIcon: <ChevronRight className="w-4 h-4" />,
    checkedIcon: <ChevronDown className="w-4 h-4" />,
  },
  {
    key: "viewMode",
    label: "View Mode",
    checked: filters.viewMode === "sectors",
    onChange: (checked: boolean) =>
      setFilters({
        ...filters,
        viewMode: checked ? "sectors" : "stocks",
      }),
    uncheckedLabel: "Stocks",
    checkedLabel: "Sectors",
    uncheckedIcon: <LineChart className="w-4 h-4" />,
    checkedIcon: <PieChart className="w-4 h-4" />,
  },
  {
    key: "view",
    label: "Value vs Cost",
    checked: filters.view === "cost",
    onChange: (checked: boolean) =>
      setFilters({
        ...filters,
        view: checked ? "cost" : "value",
        etfExpanded: checked ? false : filters.etfExpanded,
      }),
    uncheckedLabel: "Value",
    checkedLabel: "Cost",
    uncheckedIcon: <Coins className="w-4 h-4" />,
    checkedIcon: <ReceiptText className="w-4 h-4" />,
  },
];
