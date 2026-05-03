"use client";

import { Portfolio } from "@/db/schema";
import { AnimatePresence } from "motion/react";
import PortfolioItem from "./components/PortfolioItem";

interface PortfolioListProps {
  portfolioList: Portfolio[];
}

const PortfolioList = ({ portfolioList }: PortfolioListProps) => {
  return (
    <div className="flex flex-col gap-2 md:gap-2">
      <AnimatePresence initial={false}>
        {portfolioList.map((portfolio) => (
          <PortfolioItem key={portfolio.id} portfolio={portfolio} />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default PortfolioList;
