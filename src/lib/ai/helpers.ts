import { toLocalDate } from "@/types/localDate";
import { TransactionSchemaType } from "@/types";

// AI transaction interface with shortened field names (to reduce token usage)
// Field mappings: t->transactionType, d->transactionDate, s->stockSymbol,
// icp->isCommissionPercentage, n->numberOfShares, p->pricePerShare,
// dp->dividendPerShare, ct->commissionAndTaxes, nt->note
interface AITransaction {
  t: string | null; // transactionType
  d: string | null; // transactionDate
  s: string | null; // stockSymbol
  icp: string | null; // isCommissionPercentage
  n: string | null; // numberOfShares
  p: string | null; // pricePerShare
  dp: string | null; // dividendPerShare
  ct: string | null; // commissionAndTaxes
  nt: string | null; // note
}

/**
 * Transforms AI response with shortened field names to TransactionSchemaType format.
 * Maps shortened field names back to full schema field names.
 */
const VALID_TRANSACTION_TYPES = ["buy", "sell", "dividend"] as const;
type ValidTransactionType = (typeof VALID_TRANSACTION_TYPES)[number];

const isValidType = (t: string | null): t is ValidTransactionType => {
  const normalized = t?.trim().toLowerCase();
  return VALID_TRANSACTION_TYPES.includes(normalized as ValidTransactionType);
};

export const parseTransactionsAIResponse = (aiResponse: AITransaction[]): Partial<TransactionSchemaType>[] => {
  return aiResponse.filter((item) => isValidType(item.t)).map((item) => {
    const transaction: Partial<TransactionSchemaType> = {};

    // Map: t -> type (safe — isValidType guard already confirmed this is valid)
    transaction.type = item.t!.trim().toLowerCase() as ValidTransactionType;

    // Map: d -> transactionDate
    if (item.d) {
      try {
        transaction.transactionDate = toLocalDate(item.d);
      } catch {
        // Ignore malformed AI dates; downstream validation can flag incomplete rows.
      }
    }

    // Map: s -> stockSymbol
    if (item.s) {
      transaction.stockSymbol = item.s;
    }

    // Map: icp -> isCommissionPercentage
    if (item.icp !== null) {
      const val = item.icp;
      if (val === "true" || val === "1") {
        transaction.isCommissionPercentage = true;
      } else if (val === "false" || val === "0") {
        transaction.isCommissionPercentage = false;
      }
    }

    // Map: n -> numberOfShares
    if (item.n) {
      transaction.numberOfShares = Number(item.n);
    }

    // Map: p -> pricePerShare
    if (item.p) {
      if (transaction.type === "buy" || transaction.type === "sell") {
        transaction.pricePerShare = Number(item.p);
      }
    }

    // Map: dp -> dividendPerShare
    if (item.dp) {
      if (transaction.type === "dividend") {
        transaction.dividendPerShare = Number(item.dp);
      }
    }

    // Map: ct -> commissionAndTaxes
    if (item.ct) {
      transaction.commissionAndTaxes = Number(item.ct);
    }

    // Map: nt -> note
    if (item.nt) {
      transaction.note = item.nt;
    }

    return transaction;
  });
};
