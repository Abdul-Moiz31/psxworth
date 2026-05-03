import { ErrorResponse, SuccessResponse } from "@/types";
import { AppError } from "./errors";

export const createResponse = {
  success: <T = any>(message: string, data?: T, status = 200): SuccessResponse<T> => ({
    data,
    status,
    message,
    success: true,
  }),

  error: (message: string, status = 500): ErrorResponse => ({
    status,
    success: false,
    message,
  }),

  fromError: (error: Error): ErrorResponse => {
    if (error instanceof AppError) {
      return {
        status: error.statusCode,
        success: false,
        message: error.message,
      };
    }

    return {
      status: 500,
      success: false,
      message: error.message || "An unexpected error occurred",
    };
  },
};

export const getDefaultStockPerformance = (userId: string, portfolioId: number, stockSymbol: string) => {
  return {
    userId: userId,
    totalCost: 0,
    totalInflow: 0,
    averageCost: 0,
    totalShares: 0,
    totalOutflow: 0,
    portfolioId: portfolioId,
    stockSymbol: stockSymbol,
    totalDividends: 0,
    realizedProfit: 0,
    commissionAndTaxes: 0,
  };
};
