import { LocalDate, coerceLocalDateSchema } from "@/types/localDate";
import { MAXIMUM_NUMBER_VALUE } from "@/utils/constants/constants";
import { STOCKS_INFO } from "@/utils/constants/stockSymbols";
import { createPositiveNumberSchema } from "@/utils/helpers/zodHelpers";
import { z } from "zod";

// Common properties shared across all transaction types
const baseTransactionSchema = z.object({
  portfolioId: z.coerce.number(),
  transactionDate: coerceLocalDateSchema,
  stockSymbol: z
    .string()
    .trim()
    .min(1, {
      message: "Stock symbol is required",
    })
    .transform((val) => val.toUpperCase())
    .refine((val) => STOCKS_INFO.some((stock) => stock.symbol === val), {
      message: "Invalid stock symbol",
    }),
  commissionAndTaxes: z.coerce.number().max(MAXIMUM_NUMBER_VALUE).optional(),

  isCommissionPercentage: z.union([
    z.boolean(),
    z.enum(["true", "false"]).transform((val) => val === "true"),
    z.enum(["0", "1"]).transform((val) => val === "1"),
  ]),
  note: z.string().optional(),
  numberOfShares: createPositiveNumberSchema({
    fieldName: "Number of shares",
    max: MAXIMUM_NUMBER_VALUE,
    min: 1,
  }),
});

// Buy transaction specific properties
export const buyTransactionSchema = baseTransactionSchema.extend({
  type: z.literal("buy"),
  pricePerShare: createPositiveNumberSchema({
    fieldName: "Price per share",
    max: MAXIMUM_NUMBER_VALUE,
    min: 0,
  }),
});

// Sell transaction specific properties
export const sellTransactionSchema = baseTransactionSchema.extend({
  type: z.literal("sell"),
  pricePerShare: createPositiveNumberSchema({
    fieldName: "Price per share",
    max: MAXIMUM_NUMBER_VALUE,
    min: 0,
  }),
});

// Dividend transaction specific properties
export const dividendTransactionSchema = baseTransactionSchema.extend({
  type: z.literal("dividend"),
  dividendPerShare: createPositiveNumberSchema({
    fieldName: "Dividend per share",
    max: MAXIMUM_NUMBER_VALUE,
    min: 0,
  }),
});

// Combined transaction schema as a discriminated union
export const transactionSchema = z.discriminatedUnion("type", [
  buyTransactionSchema,
  sellTransactionSchema,
  dividendTransactionSchema,
]);

// Types
export type BuyTransactionSchemaType = z.infer<typeof buyTransactionSchema>;
export type BuyTransaction = BuyTransactionSchemaType & {
  id: number;
};
export type SellTransactionSchemaType = z.infer<typeof sellTransactionSchema>;
export type SellTransaction = SellTransactionSchemaType & {
  id: number;
};

export type DividendTransactionSchemaType = z.infer<typeof dividendTransactionSchema>;
export type DividendTransaction = DividendTransactionSchemaType & {
  id: number;
};

export type TransactionSchemaType = z.infer<typeof transactionSchema>;
export type Transaction = TransactionSchemaType & {
  id: number;
};

export type { LocalDate };
