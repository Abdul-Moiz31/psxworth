"use client";

import { recalculatePortfolioPerformance } from "@/actions/portfolioPerformance/portfolioPerformance";
import { toast } from "@/components/molecules/Toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRateLimit } from "./useRateLimit";

export const usePortfolioPerformance = (portfolioId: number) => {
  const queryClient = useQueryClient();
  const { handleRateLimitError } = useRateLimit();

  const recalcPortfolioPerf = useMutation({
    mutationFn: async ({ portfolioId }: { portfolioId: number }) => {
      const response = await recalculatePortfolioPerformance(portfolioId);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolioPerformance", portfolioId] });
    },
    onError: (error) => {
      // Check if it's a rate limit error
      if (handleRateLimitError(error)) {
        // This was a rate limit error - hook handled it automatically
        return;
      }
      toast({ title: "Error recalculating portfolio performance", type: "error" });
    },
  });

  return {
    recalcPortfolioPerf,
  };
};
