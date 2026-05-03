import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { Filter } from "lucide-react";
import { useState } from "react";
import { PerformanceMetricMode, PerformanceSortOption } from "..";

interface PerformanceHeaderProps {
  includeDividends: boolean;
  setIncludeDividends: (value: boolean) => void;
  metricMode: PerformanceMetricMode;
  setMetricMode: (value: PerformanceMetricMode) => void;
  disableDividendsToggle: boolean;
  sortBy: PerformanceSortOption;
  setSortBy: (value: PerformanceSortOption) => void;
}

export const PerformanceHeader = ({
  includeDividends,
  setIncludeDividends,
  metricMode,
  setMetricMode,
  disableDividendsToggle,
  sortBy,
  setSortBy,
}: PerformanceHeaderProps) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-sm sm:text-lg font-semibold text-gray-100">Portfolio Returns</h2>

      {/* Desktop Controls */}
      <div className="hidden md:flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Select value={metricMode} onValueChange={(value) => setMetricMode(value as PerformanceMetricMode)}>
            <SelectTrigger className="w-[170px] h-8 bg-slate-700 border-slate-600 text-gray-100 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              <SelectItem value="cumulative" className="text-gray-100 hover:bg-slate-700">
                Cumulative Return
              </SelectItem>
              <SelectItem value="today" className="text-gray-100 hover:bg-slate-700">
                Today&apos;s Return
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px] h-8 bg-slate-700 border-slate-600 text-gray-100 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              <SelectItem value="profit-desc" className="text-gray-100 hover:bg-slate-700">
                Return (High to Low)
              </SelectItem>
              <SelectItem value="profit-asc" className="text-gray-100 hover:bg-slate-700">
                Return (Low to High)
              </SelectItem>
              <SelectItem value="symbol-asc" className="text-gray-100 hover:bg-slate-700">
                Symbol (A to Z)
              </SelectItem>
              <SelectItem value="symbol-desc" className="text-gray-100 hover:bg-slate-700">
                Symbol (Z to A)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Toggle
          checked={includeDividends}
          onChange={setIncludeDividends}
          checkedLabel="Dividends ✓"
          uncheckedLabel="Dividends ✗"
          className="sm:min-w-[400px]"
          disabled={disableDividendsToggle}
        />
      </div>

      {/* Mobile Filters Drawer */}
      <div className="md:hidden">
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerTrigger asChild>
            <Button variant="outline" size="sm" className="bg-slate-800 border-slate-600 hover:bg-slate-700">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </DrawerTrigger>
          <DrawerContent className="bg-slate-900 border-slate-700">
            <DrawerHeader>
              <DrawerTitle className="text-gray-100">Chart Filters</DrawerTitle>
            </DrawerHeader>
            <div className="p-6 space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-300">Metric mode</label>
                <Select value={metricMode} onValueChange={(value) => setMetricMode(value as PerformanceMetricMode)}>
                  <SelectTrigger className="w-full bg-slate-800 border-slate-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="cumulative" className="text-gray-100 hover:bg-slate-700">
                      Cumulative Return
                    </SelectItem>
                    <SelectItem value="today" className="text-gray-100 hover:bg-slate-700">
                      Today&apos;s Return
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-300">Sort by</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full bg-slate-800 border-slate-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="profit-desc" className="text-gray-100 hover:bg-slate-700">
                      Return (High to Low)
                    </SelectItem>
                    <SelectItem value="profit-asc" className="text-gray-100 hover:bg-slate-700">
                      Return (Low to High)
                    </SelectItem>
                    <SelectItem value="symbol-asc" className="text-gray-100 hover:bg-slate-700">
                      Symbol (A to Z)
                    </SelectItem>
                    <SelectItem value="symbol-desc" className="text-gray-100 hover:bg-slate-700">
                      Symbol (Z to A)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-300">Include Dividends</label>
                <Toggle
                  checked={includeDividends}
                  onChange={setIncludeDividends}
                  checkedLabel="Dividends ✓"
                  uncheckedLabel="Dividends ✗"
                  disabled={disableDividendsToggle}
                />
                {disableDividendsToggle && (
                  <p className="text-xs text-gray-400">Dividends are available in Cumulative Return mode only.</p>
                )}
              </div>

              <div className="pt-4">
                <Button
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Done
                </Button>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
};
