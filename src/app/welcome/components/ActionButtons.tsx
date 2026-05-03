"use client";

import CreatePortfolioDialog from "@/app/portfolio/[portfolioId]/components/CreatePortfolioDialog";
import { Button } from "@/components/ui/button";
import * as motion from "motion/react-client";

export const ActionButtons = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.15 }}
      className="flex flex-col items-center justify-center gap-4 sm:flex-row"
    >
      <CreatePortfolioDialog
        navigateOnSuccess
        trigger={
          <Button size="lg" className="h-12 px-8 text-base font-medium">
            Create New Portfolio
          </Button>
        }
      />

      <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base font-medium">
        <a href="/portfolio">Go to Portfolios</a>
      </Button>
    </motion.div>
  );
};
