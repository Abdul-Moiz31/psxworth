"use client";

import { Portfolio } from "@/db/schema";
import PortfolioList from "./PortfolioList";

interface DesktopPortfolioSidebarProps {
  portfolioList: Portfolio[];
}

export const DesktopPortfolioSidebar = ({ portfolioList }: DesktopPortfolioSidebarProps) => {
  return (
    <div>
      <div className="no-scrollbar h-[32rem] overflow-x-hidden overflow-y-auto pr-1">
        <PortfolioList portfolioList={portfolioList} />
      </div>
    </div>
  );
};

export default DesktopPortfolioSidebar;
