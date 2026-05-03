import { coerceToLocalDateDate } from "@/types/localDate";
import { BuyTransaction, DividendTransaction, SellTransaction, TransactionSchemaType } from "@/types";

export const formatTransactionSummary = (transaction: TransactionSchemaType) => {
  const { type, stockSymbol, numberOfShares, transactionDate, isCommissionPercentage } = transaction;
  const date = transactionDate ? ` on ${coerceToLocalDateDate(transactionDate).toLocaleDateString()}` : "";

  if (transaction.type === "buy") {
    const { pricePerShare, commissionAndTaxes } = transaction as BuyTransaction;
    return `Buy ${numberOfShares} shares of ${stockSymbol} at $${pricePerShare} with $${commissionAndTaxes} commission${date}`;
  } else if (transaction.type === "sell") {
    const { pricePerShare, commissionAndTaxes } = transaction as SellTransaction;
    return `Sell ${numberOfShares} shares of ${stockSymbol}${pricePerShare ? ` at $${pricePerShare}` : ""} with ${commissionAndTaxes}${isCommissionPercentage ? "%" : "$"} commission${date}`;
  } else if (transaction.type === "dividend") {
    const { dividendPerShare, commissionAndTaxes } = transaction as DividendTransaction;
    return `Received $${dividendPerShare} dividend per share for ${stockSymbol}${numberOfShares ? ` (${numberOfShares} shares)` : ""} with $${commissionAndTaxes} commission${date}`;
  }

  return `${type} transaction for ${stockSymbol}`;
};
