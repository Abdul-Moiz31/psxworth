"use client";

import { FiltersDrawer } from "@/components/molecules/FiltersDrawer";
import { Toggle } from "@/components/ui/toggle";
import { PieChart as PieChartIcon, Scale } from "lucide-react";
import { useState } from "react";
import { AllocationPerformanceHeaderProps } from "./types";

export const AllocationPerformanceHeader = ({
  title = "Allocation vs Total Return",
  viewMode,
  setViewMode,
  includeDividends,
  setIncludeDividends,
}: AllocationPerformanceHeaderProps) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const hasActiveFilters = viewMode !== "stocks" || !includeDividends;

  const viewModeToggle = (
    <Toggle
      checked={viewMode === "sectors"}
      onChange={(checked) => setViewMode(checked ? "sectors" : "stocks")}
      uncheckedLabel="Stocks"
      uncheckedIcon={<Scale className="w-4 h-4" />}
      checkedLabel="Sectors"
      checkedIcon={<PieChartIcon className="w-4 h-4" />}
    />
  );

  const dividendsToggle = (
    <Toggle
      checked={includeDividends}
      onChange={(checked) => setIncludeDividends(checked)}
      uncheckedLabel="Dividends ✗"
      checkedLabel="Dividends ✓"
    />
  );

  return (
    <div className="flex items-center justify-between flex-col md:flex-row gap-6 ">
      <div className="flex md:flex-col justify-between w-full">
        <h2 className="text-sm sm:text-lg font-semibold text-gray-100">{title}</h2>
        <div className="md:hidden">
          <FiltersDrawer
            title="Filter Allocation vs Total Return"
            hasActiveFilters={hasActiveFilters}
            open={isDrawerOpen}
            onOpenChange={setIsDrawerOpen}
          >
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-300">View mode</label>
              {viewModeToggle}
            </div>
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-300">Dividends</label>
              {dividendsToggle}
            </div>
          </FiltersDrawer>
        </div>
      </div>

      <div className="hidden md:flex flex-col sm:flex-row gap-2 w-full">
        {viewModeToggle}
        {dividendsToggle}
      </div>
    </div>
  );
};

export default AllocationPerformanceHeader;
