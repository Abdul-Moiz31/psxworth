"use server";

import { db } from "@/db";
import { transactionTable } from "@/db/schema";
import { clerkClient } from "@clerk/nextjs/server";
import { count } from "drizzle-orm";
import { unstable_cache } from "next/cache";

export type StatsSummary = {
  totalUsers: number;
  totalTransactions: number;
  timestamp: string;
};

export const fetchStatsSummary = unstable_cache(
  async (): Promise<StatsSummary | null> => {
    try {
      const client = await clerkClient();
      const users = await client.users.getUserList({ limit: 1 });
      const usersCount = users.totalCount ?? users.data.length;

      const [{ count: rawTransactionsCount } = { count: 0 }] = await db
        .select({ count: count() })
        .from(transactionTable);

      const transactionsCount = (() => {
        const value = rawTransactionsCount ?? 0;
        return typeof value === "bigint" ? Number(value) : Number(value);
      })();

      return {
        totalUsers: usersCount,
        totalTransactions: transactionsCount,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Failed to fetch stats summary", error);
      return null;
    }
  },
  ["stats-summary"],
  { revalidate: 300 }
);
