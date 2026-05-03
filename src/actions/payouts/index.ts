"use server";

import { withErrorHandling, requireAuth } from "@/actions/utils/middleware";
import { dataDb } from "@/db";
import { payouts } from "@/db/datadb-schema";
import { and, gte, inArray, lte } from "drizzle-orm";

type GetUpcomingPayoutsParams = {
  symbols: string[];
  from?: Date;
  to?: Date;
  limit?: number;
};

export type UpcomingPayoutRecord = {
  naturalKey: string;
  symbol: string;
  name: string | null;
  logoUrl: string | null;
  actionType: string; // 'dividend' | 'bonus' | 'split' | 'right'
  exDate: Date;
  percentValue: number | null;
  faceValue: number | null;
};

export const getUpcomingPayoutsForSymbols = withErrorHandling(
  async ({ symbols, from, to, limit }: GetUpcomingPayoutsParams) => {
    await requireAuth();

    const fromDate = from ?? new Date();
    const toDate = to;

    if (!symbols || symbols.length === 0) {
      return [] as UpcomingPayoutRecord[];
    }

    const whereClauses = [inArray(payouts.symbol, symbols), gte(payouts.exDate, fromDate)];
    if (toDate) {
      whereClauses.push(lte(payouts.exDate, toDate));
    }

    const rows = await dataDb
      .select({
        naturalKey: payouts.naturalKey,
        symbol: payouts.symbol,
        name: payouts.name,
        logoUrl: payouts.logoUrl,
        actionType: payouts.actionType,
        exDate: payouts.exDate,
        percentValue: payouts.percentValue,
        faceValue: payouts.faceValue,
      })
      .from(payouts)
      .where(and(...whereClauses))
      .limit(limit ?? 100);

    return rows as UpcomingPayoutRecord[];
  }
);

type GetAllUpcomingPayoutsParams = {
  from?: Date;
  to?: Date;
  limit?: number;
};

export const getAllUpcomingPayouts = withErrorHandling(async ({ from, to, limit }: GetAllUpcomingPayoutsParams) => {
  await requireAuth();

  const fromDate = from ?? new Date();
  const toDate = to;

  const whereClauses = [gte(payouts.exDate, fromDate)];
  if (toDate) {
    whereClauses.push(lte(payouts.exDate, toDate));
  }

  const rows = await dataDb
    .select({
      naturalKey: payouts.naturalKey,
      symbol: payouts.symbol,
      name: payouts.name,
      logoUrl: payouts.logoUrl,
      actionType: payouts.actionType,
      exDate: payouts.exDate,
      percentValue: payouts.percentValue,
      faceValue: payouts.faceValue,
    })
    .from(payouts)
    .where(and(...whereClauses))
    .limit(limit ?? 100);

  return rows as UpcomingPayoutRecord[];
});
