import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { returnTypeLabels, scopeLabels } from "../shared/constants";
import { ReturnType, Scope, DateRange } from "../shared/types";
import { ReturnTypeTooltip } from "./ReturnTypeTooltip";

interface DesktopFiltersProps {
  returnType: ReturnType;
  onReturnTypeChange: (type: ReturnType) => void;
  scope: Scope;
  onScopeChange: (scope: Scope) => void;
  onSelectedStockChange: (stock: string) => void;
  effectiveSelectedStock: string;
  availableStocks: string[];
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

export function DesktopFilters({
  returnType,
  onReturnTypeChange,
  scope,
  onScopeChange,
  onSelectedStockChange,
  effectiveSelectedStock,
  availableStocks,
  dateRange,
  onDateRangeChange,
}: DesktopFiltersProps) {
  return (
    <div className="hidden md:flex gap-2 w-full items-center justify-end flex-nowrap">
      <div className="flex items-center gap-1.5">
        <ReturnTypeTooltip returnType={returnType} />
        <Select value={returnType} onValueChange={(value) => onReturnTypeChange(value as ReturnType)}>
          <SelectTrigger className="w-[120px] h-8 bg-slate-700 border-slate-600 text-gray-100 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-600">
            <SelectItem value="twr" className="text-gray-100 hover:bg-slate-700">
              {returnTypeLabels.twr}
            </SelectItem>
            <SelectItem value="mwr" className="text-gray-100 hover:bg-slate-700">
              {returnTypeLabels.mwr}
            </SelectItem>
            <SelectItem value="simple" className="text-gray-100 hover:bg-slate-700">
              {returnTypeLabels.simple}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Select
        value={scope}
        onValueChange={(value) => {
          const newScope = value as Scope;
          onScopeChange(newScope);
          if (newScope !== "stock") {
            onSelectedStockChange("");
          }
        }}
      >
        <SelectTrigger className="w-[120px] h-8 bg-slate-700 border-slate-600 text-gray-100 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-slate-800 border-slate-600">
          <SelectItem value="portfolio" className="text-gray-100 hover:bg-slate-700">
            {scopeLabels.portfolio}
          </SelectItem>
          <SelectItem value="stock" className="text-gray-100 hover:bg-slate-700">
            {scopeLabels.stock}
          </SelectItem>
        </SelectContent>
      </Select>

      {scope === "stock" && (
        <Select value={effectiveSelectedStock} onValueChange={onSelectedStockChange}>
          <SelectTrigger className="w-[140px] h-8 bg-slate-700 border-slate-600 text-gray-100 text-sm">
            <SelectValue placeholder="Select a stock" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-600">
            {availableStocks.map((symbol) => (
              <SelectItem key={symbol} value={symbol} className="text-gray-100 hover:bg-slate-700">
                {symbol}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      <DateRangePicker
        key={`${dateRange.startDate.getTime()}-${dateRange.endDate.getTime()}`}
        initialDateFrom={dateRange.startDate}
        initialDateTo={dateRange.endDate}
        onUpdate={(values) => {
          if (values.range.from && values.range.to) {
            onDateRangeChange({
              startDate: values.range.from,
              endDate: values.range.to,
            });
          }
        }}
        showCompare={false}
        align="end"
        triggerClassName="h-8 text-sm bg-slate-700 border-slate-600 text-gray-100 hover:bg-slate-600"
      />
    </div>
  );
}
