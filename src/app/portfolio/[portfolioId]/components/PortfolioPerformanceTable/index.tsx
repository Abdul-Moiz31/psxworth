"use client";

import { StockDetailedPerformance } from "@/interfaces";
import useBreakpoint from "@/utils/hooks/useBreakpoints";
import dynamic from "next/dynamic";
import React from "react";
import { portfolioPerformanceTableDesktopColumns, portfolioPerformanceTableMobileColumns } from "./components/Columns";
import { DataTable } from "./components/DataTable";

interface PortfolioPerformanceTableProps {
  data: StockDetailedPerformance[];
  emptyMessage?: string;
  sticky?: boolean;
}

export const PortfolioPerformanceTable = (props: PortfolioPerformanceTableProps) => {
  const { data, emptyMessage, sticky = true } = props;
  const { isSmall, isMedium } = useBreakpoint();
  const shouldShowMobileLayout = isSmall || isMedium;

  const [shouldShowFullTable, setShouldShowFullTable] = React.useState(!shouldShowMobileLayout);

  const handleToggle = React.useCallback((fullTable: boolean) => {
    setShouldShowFullTable(fullTable);
  }, []);

  return (
    <>
      <DataTable
        columns={shouldShowFullTable ? portfolioPerformanceTableDesktopColumns : portfolioPerformanceTableMobileColumns}
        data={data}
        shouldShowMobileLayout={shouldShowMobileLayout}
        onToggleView={handleToggle}
        emptyMessage={emptyMessage}
        sticky={sticky}
      />
    </>
  );
};

// Because we are using useBreakpoint that depends on window,
// we need to disable SSR for this component so that we get proper
// breakpoints on the client side.
const PortfolioPerformanceTableWithoutSSR = dynamic(() => Promise.resolve(PortfolioPerformanceTable), { ssr: false });

export default PortfolioPerformanceTableWithoutSSR;
