import { z } from "zod";

/**
 * Zod schema for AI transaction parsing with shortened field names to reduce token usage.
 * Each field is nullable: if null, the field couldn't be determined with accuracy.
 * If a value exists, it's considered determined.
 * Using shortened field names to reduce token usage.
 * Field name mappings (short -> full):
 * - t: transactionType
 * - d: transactionDate
 * - s: stockSymbol
 * - icp: isCommissionPercentage
 * - n: numberOfShares
 * - p: pricePerShare
 * - dp: dividendPerShare
 * - ct: commissionAndTaxes
 * - nt: note
 */
export const transactionsAISchema = z.object({
  transactions: z.array(
    z.object({
      t: z
        .string()
        .nullable()
        .describe("Transaction type: 'buy'|'sell'|'dividend'|null (null if cannot be determined with accuracy)"),
      d: z
        .string()
        .nullable()
        .describe("Transaction date as ISO date-time string or null (null if cannot be determined with accuracy)"),
      s: z.string().nullable().describe("Stock symbol (ticker) or null (null if cannot be determined with accuracy)"),
      icp: z
        .string()
        .nullable()
        .describe(
          "Commission type: 'true' if commission value is provided as percentage, 'false' if commission value is provided as absolute deducted amount, or null if cannot be determined with accuracy"
        ),
      n: z
        .string()
        .nullable()
        .describe("Number of shares as numeric string or null (null if cannot be determined with accuracy)"),
      p: z
        .string()
        .nullable()
        .describe("Price per share as numeric string or null (null if cannot be determined with accuracy)"),
      dp: z
        .string()
        .nullable()
        .describe("Dividend per share as numeric string or null (null if cannot be determined with accuracy)"),
      ct: z
        .string()
        .nullable()
        .describe("Commission and taxes as numeric string or null (null if cannot be determined with accuracy)"),
      nt: z
        .string()
        .nullable()
        .describe("Note as string or null (null if not present or cannot be determined with accuracy)"),
    })
  ),
});

export type TransactionsAIResponse = z.infer<typeof transactionsAISchema>;
