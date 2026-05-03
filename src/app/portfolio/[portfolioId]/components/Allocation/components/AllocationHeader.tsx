import { FiltersDrawer } from "@/components/molecules/FiltersDrawer";
import { Toggle } from "@/components/ui/toggle";
import { formatCurrency } from "@/utils/helpers/formatHelpers";
import { useState } from "react";
import { buildAllocationToggleConfigs } from "../utils/toggleConfigs";
import { AllocationFilters, AllocationToggleConfig } from "../utils/types";

interface AllocationHeaderProps {
  filters: AllocationFilters;
  setFilters: (filters: AllocationFilters) => void;
  totalAmount: number;
}

export const AllocationHeader = ({ filters, setFilters, totalAmount }: AllocationHeaderProps) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const toggleConfigs = buildAllocationToggleConfigs({ filters, setFilters });
  const hasActiveFilters = filters.view !== "value" || filters.viewMode !== "stocks" || filters.etfExpanded;

  const renderToggle = (config: AllocationToggleConfig) => (
    <Toggle
      key={config.key}
      checked={config.checked}
      onChange={config.onChange}
      uncheckedLabel={config.uncheckedLabel}
      uncheckedIcon={config.uncheckedIcon}
      checkedLabel={config.checkedLabel}
      checkedIcon={config.checkedIcon}
      className="w-auto"
    />
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-row md:flex-col justify-between md:justify-start md:gap-1">
          <div>
            <h2 className="text-sm sm:text-lg font-semibold text-gray-100">Portfolio Allocation</h2>
            <p className="text-sm text-gray-200">
              Total {filters.view === "value" ? "Value" : "Cost"}: {formatCurrency(totalAmount)}
            </p>
          </div>
          {/* Mobile filters */}
          <div className="md:hidden flex">
            <FiltersDrawer
              title="Filter Allocation"
              hasActiveFilters={hasActiveFilters}
              open={isDrawerOpen}
              onOpenChange={setIsDrawerOpen}
            >
              {toggleConfigs.map((config) => (
                <div key={config.key} className="space-y-3">
                  <label className="text-sm font-medium text-gray-300">{config.label}</label>
                  {renderToggle(config)}
                </div>
              ))}
            </FiltersDrawer>
          </div>
        </div>

        {/* Desktop filters */}
        <div className="hidden md:flex gap-2 w-full md:w-auto justify-end flex-1">
          {toggleConfigs.map(renderToggle)}
        </div>
      </div>
    </div>
  );
};
