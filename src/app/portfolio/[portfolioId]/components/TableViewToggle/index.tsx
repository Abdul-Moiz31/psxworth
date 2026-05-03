"use client";

import { Button } from "@/components/ui/button";
import clsx from "clsx";
import React from "react";

interface TableViewToggleProps {
  shouldShowMobileLayout: boolean;
  onToggle: (shouldShowFullTable: boolean) => void;
  className?: string;
}

export const TableViewToggle = ({ shouldShowMobileLayout, onToggle, className }: TableViewToggleProps) => {
  const [isManualToggle, setIsManualToggle] = React.useState(false);
  const [manualFullTable, setManualFullTable] = React.useState(false);

  // Determine which view to show
  const shouldShowFullTable = isManualToggle ? manualFullTable : !shouldShowMobileLayout;

  const handleToggle = () => {
    setIsManualToggle(true);
    const newFullTableState = !shouldShowFullTable;
    setManualFullTable(newFullTableState);
    onToggle(newFullTableState);
  };

  // Reset manual toggle when breakpoint changes significantly
  React.useEffect(() => {
    setIsManualToggle(false);
    onToggle(!shouldShowMobileLayout);
  }, [shouldShowMobileLayout, onToggle]);

  // Notify parent of initial state
  /* eslint-disable react-hooks/exhaustive-deps */
  React.useEffect(() => {
    onToggle(shouldShowFullTable);
  }, []);

  return (
    <Button onClick={handleToggle} className={clsx("relative h-8", className)} size="sm" variant="outline">
      <div className={clsx(shouldShowFullTable ? "visible" : "invisible")}>Compact Table</div>

      <div className={clsx("absolute", shouldShowFullTable ? "invisible" : "visible")}>Full Table</div>
    </Button>
  );
};
