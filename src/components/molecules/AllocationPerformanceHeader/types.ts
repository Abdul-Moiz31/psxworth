export type ViewMode = "stocks" | "sectors";

export interface AllocationPerformanceHeaderProps {
  title?: string;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  includeDividends: boolean;
  setIncludeDividends: (include: boolean) => void;
}
