import { createPortfolio, updatePortfolio } from "@/actions/portfolio/portfolioActions";
import { toast } from "@/components/molecules/Toast";
import { Portfolio } from "@/db/schema";
import { useMutation } from "@tanstack/react-query";
import { handleServerPromise } from "../helpers/server";

export const usePortfolio = () => {
  const createPortfolioMutation = useMutation({
    mutationFn: (data: Omit<Portfolio, "userId" | "createdAt" | "updatedAt" | "id">) =>
      handleServerPromise(createPortfolio(data)),
    onSuccess: (data) => {
      toast({
        type: "success",
        title: "Portfolio Created Successfully.",
        description: "You can now add transactions.",
      });
      return data;
    },
    onError: (error) => {
      toast({ title: error.message, type: "error" });
    },
  });

  const updatePortfolioMutation = useMutation({
    mutationFn: (data: Portfolio) => handleServerPromise(updatePortfolio(data)),
    onSuccess: (data) => {
      toast({
        type: "success",
        title: "Portfolio Updated Successfully.",
      });
      return data;
    },
    onError: (error) => {
      toast({ title: error.message, type: "error" });
    },
  });

  return {
    createPortfolioMutation,
    updatePortfolioMutation,
  };
};
