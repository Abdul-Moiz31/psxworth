import { Transaction } from "@/types";

/**
 * Calculates the total value for a transaction
 */
export function calculateTotalValue(transaction: Transaction): number {
  let baseValue = 0;

  if (transaction.type === "buy" || transaction.type === "sell") {
    baseValue = transaction.pricePerShare * transaction.numberOfShares;
  } else if (transaction.type === "dividend") {
    baseValue = transaction.dividendPerShare * transaction.numberOfShares;
  }

  const commissionAndTaxes = calculateCommissionAndTaxes(transaction, baseValue);

  if (transaction.type === "buy") {
    // For buy transactions, add commission/taxes (you pay more)
    return baseValue + commissionAndTaxes;
  } else if (transaction.type === "sell" || transaction.type === "dividend") {
    // For sell and dividend transactions, subtract commission/taxes (you receive less)
    return baseValue - commissionAndTaxes;
  }

  return 0;
}

/**
 * Calculates the commission and taxes value for a transaction
 */
export function calculateCommissionAndTaxes(transaction: Transaction, baseValue?: number): number {
  if (!transaction.commissionAndTaxes) {
    return 0;
  }

  // Use provided baseValue or calculate it
  const value = baseValue ?? calculateBaseValueForCommission(transaction);

  return transaction.isCommissionPercentage
    ? (transaction.commissionAndTaxes / 100) * value
    : transaction.commissionAndTaxes;
}

/**
 * Calculates the base value used for commission calculation
 */
function calculateBaseValueForCommission(transaction: Transaction): number {
  if (transaction.type === "buy" || transaction.type === "sell") {
    return transaction.pricePerShare * transaction.numberOfShares;
  } else if (transaction.type === "dividend") {
    return transaction.dividendPerShare * transaction.numberOfShares;
  }
  return 0;
}
