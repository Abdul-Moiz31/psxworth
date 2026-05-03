"use client";

import { FiltersDrawer } from "@/components/molecules/FiltersDrawer";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { returnTypeLabels, scopeLabels } from "../shared/constants";
import { ReturnType, Scope, DateRange } from "../shared/types";
import { ReturnTypeTooltip } from "./ReturnTypeTooltip";

interface MobileFiltersProps {
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

export function MobileFilters({
  returnType,
  onReturnTypeChange,
  scope,
  onScopeChange,
  onSelectedStockChange,
  effectiveSelectedStock,
  availableStocks,
  dateRange,
  onDateRangeChange,
}: MobileFiltersProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Check if any filters are active (non-default values)
  const hasActiveFilters = returnType !== "twr" || scope !== "portfolio";

  return (
    <FiltersDrawer
      title="Filter Historical Returns"
      hasActiveFilters={hasActiveFilters}
      open={isDrawerOpen}
      onOpenChange={setIsDrawerOpen}
    >
      {/* First row: TWR */}
      <div className="space-y-3">
        <Select value={returnType} onValueChange={(value) => onReturnTypeChange(value as ReturnType)}>
          <SelectTrigger className="w-full bg-slate-700 border-slate-600 text-slate-100">
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
        <ReturnTypeTooltip returnType={returnType} className="w-full justify-start px-3 text-left" />
      </div>

      {/* Second row: Portfolio */}
      <div className="space-y-3">
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
          <SelectTrigger className="w-full bg-slate-700 border-slate-600 text-slate-100">
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
            <SelectTrigger className="w-full bg-slate-700 border-slate-600 text-slate-100">
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
      </div>

      {/* Third row: Date range */}
      <div className="space-y-3">
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
          align="start"
          triggerClassName="h-10 text-sm bg-slate-700 border-slate-600 text-gray-100 hover:bg-slate-600 w-full"
        />
      </div>
    </FiltersDrawer>
  );
}
