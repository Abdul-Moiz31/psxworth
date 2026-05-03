"use client";

import { Portfolio } from "@/db/schema";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef } from "react";
import PortfolioCard from "../../PortfolioCard";
import PortfolioList from "./PortfolioList";

interface MobilePortfolioSidebarProps {
  portfolioList: Portfolio[];
  activePortfolio: Portfolio | null;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const MobilePortfolioSidebar = ({
  portfolioList,
  activePortfolio,
  isOpen,
  setIsOpen,
}: MobilePortfolioSidebarProps) => {
  const lastActivePortfolio = useRef<Portfolio | null>(null);

  // Close mobile menu when active portfolio changes
  useEffect(() => {
    if (lastActivePortfolio.current && activePortfolio?.id !== lastActivePortfolio.current?.id && isOpen) {
      setTimeout(() => {
        setIsOpen(false);
      }, 100);
    }
    lastActivePortfolio.current = activePortfolio;
  }, [activePortfolio, isOpen, setIsOpen]);

  return (
    <div className="md:hidden">
      <AnimatePresence mode="sync">
        {!isOpen && activePortfolio && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-1 border-b border-slate-700/30"
          >
            <PortfolioCard portfolio={activePortfolio} />
          </motion.div>
        )}
        {isOpen && (
          <motion.div
            key="portfolio-list"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, exit: { duration: 0.2 } }}
            className="overflow-hidden p-2"
          >
            <div className="no-scrollbar max-h-72 overflow-x-hidden overflow-y-auto pr-1">
              <PortfolioList portfolioList={portfolioList} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MobilePortfolioSidebar;
