import { db } from "@/db";
import { transactionTable, stockPerformanceTable } from "@/db/schema";
import { coerceToLocalDateDate } from "@/types/localDate";
import { FormState, ServerFunctionResponse, transactionSchema } from "@/types";
import { isValidStockSymbol } from "@/utils/helpers/helpers";
import { captureException } from "@/utils/posthog/helpers";
import { eq, and } from "drizzle-orm";

export const validateTransactionData = (data: FormData): FormState | { success: true; data: any } => {
  const formData = Object.fromEntries(data);
  const parsingResult = transactionSchema.safeParse(formData);

  if (!parsingResult.success) {
    const formattedErrors = Object.entries(parsingResult.error.flatten().fieldErrors)
      .map(([field, errors]) => `${field}: ${errors?.join(", ")}`)
      .join("; ");

    return {
      message: `Validation failed: ${formattedErrors || parsingResult.error.message}`,
      success: false,
    };
  }

  return { success: true, data: parsingResult.data };
};

export function sortTransactionsByDateAndType(transactions: any[]): any[] {
  return [...transactions].sort((a, b) => {
    const dateA = coerceToLocalDateDate(a.transactionDate);
    const dateB = coerceToLocalDateDate(b.transactionDate);

    // First sort by date
    if (dateA.getTime() !== dateB.getTime()) {
      return dateA.getTime() - dateB.getTime();
    }

    // On same date, sort by transaction type priority:
    // buy (1) -> dividend (2) -> sell (3)
    const getTypePriority = (type: string): number => {
      switch (type) {
        case "buy":
          return 1;
        case "dividend":
          return 2;
        case "sell":
          return 3;
        default:
          return 4; // Any other transaction types come last
      }
    };

    const priorityA = getTypePriority(a.type);
    const priorityB = getTypePriority(b.type);

    return priorityA - priorityB;
  });
}

/**
 * Cleans up invalid stock transactions by removing all transactions and performance data
 * for invalid stock symbols in a specific portfolio
 * @param portfolioId The portfolio ID to clean up
 * @param stockSymbol The invalid stock symbol to remove
 * @param tx Optional transaction object for database operations
 */
export async function cleanupInvalidStockTransactions(
  portfolioId: number,
  stockSymbol: string,
  tx?: any
): Promise<ServerFunctionResponse> {
  try {
    const dbOrTx = tx || db;

    if (isValidStockSymbol(stockSymbol)) {
      return {
        message: "Invalid stock symbol",
        success: false,
        status: 400,
      };
    }

    // Delete all transactions for this stock symbol in this portfolio
    await dbOrTx
      .delete(transactionTable)
      .where(and(eq(transactionTable.portfolioId, portfolioId), eq(transactionTable.stockSymbol, stockSymbol)));

    // Delete performance data for this stock symbol in this portfolio
    await dbOrTx
      .delete(stockPerformanceTable)
      .where(
        and(eq(stockPerformanceTable.portfolioId, portfolioId), eq(stockPerformanceTable.stockSymbol, stockSymbol))
      );

    return {
      message: "Invalid stock transactions cleaned up successfully",
      success: true,
      status: 200,
    };
  } catch (error: any) {
    captureException(error);
    return {
      message: "Failed to cleanup invalid stock transactions",
      success: false,
      status: 500,
    };
  }
}
