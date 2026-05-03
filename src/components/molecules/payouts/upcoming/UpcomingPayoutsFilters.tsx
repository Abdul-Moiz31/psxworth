"use client";

import { FiltersDrawer } from "@/components/molecules/FiltersDrawer";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { Search } from "lucide-react";
import React, { useState } from "react";

export type UpcomingPayoutsTypeFilter = "all" | "dividend" | "bonus" | "split" | "right";

type Props = {
  query: string;
  onQueryChange: (value: string) => void;
  typeFilter: UpcomingPayoutsTypeFilter;
  onTypeFilterChange: (value: UpcomingPayoutsTypeFilter) => void;
  showAll: boolean;
  onShowAllChange: (showAll: boolean) => void;
};

export const UpcomingPayoutsFilters: React.FC<Props> = ({
  query,
  onQueryChange,
  typeFilter,
  onTypeFilterChange,
  showAll,
  onShowAllChange,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const options: { label: string; value: UpcomingPayoutsTypeFilter }[] = [
    { label: "All", value: "all" },
    { label: "Dividend", value: "dividend" },
    { label: "Bonus", value: "bonus" },
    { label: "Split", value: "split" },
    { label: "Right", value: "right" },
  ];

  // Check if any filters are active
  const hasActiveFilters = query.trim() !== "" || showAll || typeFilter !== "all";

  return (
    <div className="w-full">
      {/* Desktop Controls */}
      <div className="hidden md:flex items-center justify-end gap-3">
        <div className="relative flex-1 max-w-md">
          <div className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-900/50 text-slate-300">
              <Search className="h-4 w-4" />
            </div>
          </div>
          <Input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search symbol..."
            className="h-9 px-2.5 pl-11 bg-slate-800/60 border-slate-700 text-slate-100 placeholder:text-slate-400 focus:bg-slate-800/80 transition-colors"
          />
        </div>

        <div className="w-full max-w-[300px] shrink-0">
          <Toggle checked={showAll} onChange={onShowAllChange} checkedLabel="All Stocks" uncheckedLabel="My Holdings" />
        </div>

        <div className="shrink-0">
          <Select value={typeFilter} onValueChange={(value) => onTypeFilterChange(value as UpcomingPayoutsTypeFilter)}>
            <SelectTrigger className="w-[140px] h-8 bg-slate-700 border-slate-600 text-gray-100 text-sm">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-gray-100 hover:bg-slate-700">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Mobile Controls */}
      <div className="md:hidden flex gap-2 items-center">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-900/50 text-slate-300">
              <Search className="h-4 w-4" />
            </div>
          </div>
          <Input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search symbol..."
            className="h-9 px-2.5 pl-11 bg-slate-800/60 border-slate-700 text-slate-100 placeholder:text-slate-400 focus:bg-slate-800/80 transition-colors"
          />
        </div>

        <FiltersDrawer
          title="Filter Payouts"
          hasActiveFilters={hasActiveFilters}
          open={isDrawerOpen}
          onOpenChange={setIsDrawerOpen}
        >
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-300">Show</label>
            <Toggle
              checked={showAll}
              onChange={onShowAllChange}
              checkedLabel="All Stocks"
              uncheckedLabel="My Holdings"
            />
          </div>

          <div className="space-y-3 pt-2">
            <label className="text-sm font-medium text-gray-300">Payout Type</label>
            <Select
              value={typeFilter}
              onValueChange={(value) => onTypeFilterChange(value as UpcomingPayoutsTypeFilter)}
            >
              <SelectTrigger className="w-full bg-slate-700 border-slate-600 text-slate-100">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                {options.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="text-gray-100 hover:bg-slate-700">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </FiltersDrawer>
      </div>
    </div>
  );
};

export default UpcomingPayoutsFilters;
