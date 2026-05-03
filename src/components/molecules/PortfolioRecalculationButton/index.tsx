"use client";

import { toast } from "@/components/molecules/Toast";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePortfolioPerformance } from "@/utils/hooks/usePortfolioPerformance";
import { RefreshCcw } from "lucide-react";
import { ConfirmationDialog } from "../ConfirmationDialog";

interface PortfolioRecalculationButtonProps {
  portfolioId: number;
  className?: string;
}

const PortfolioRecalculationButton = ({ portfolioId, className = "" }: PortfolioRecalculationButtonProps) => {
  const { recalcPortfolioPerf } = usePortfolioPerformance(portfolioId);

  const handleRecalculation = () => {
    recalcPortfolioPerf.mutate(
      { portfolioId },
      {
        onSuccess: () => {
          toast({
            title: "Portfolio performance recalculated successfully",
            type: "success",
          });
        },
      }
    );
  };

  return (
    <div className={cn("flex items-center", className)}>
      <ConfirmationDialog
        title="Recalculate Portfolio Performance"
        description="This will recalculate your portfolio performance metrics. This action may take a few moments and should only be used when necessary."
        confirmText="Recalculate"
        cancelText="Cancel"
        onConfirm={handleRecalculation}
        useHoldToConfirm={true}
        holdDuration={2000}
        trigger={
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "bg-slate-700 border-slate-600 hover:bg-slate-600 text-gray-300 px-2 sm:px-3",
              recalcPortfolioPerf.isPending && "opacity-50 cursor-not-allowed"
            )}
          >
            <RefreshCcw className={cn("h-4 w-4 sm:mr-2", recalcPortfolioPerf.isPending && "animate-spin-reverse")} />
            <span className="hidden sm:inline">Recalculate</span>
          </Button>
        }
      />
    </div>
  );
};

export default PortfolioRecalculationButton;
