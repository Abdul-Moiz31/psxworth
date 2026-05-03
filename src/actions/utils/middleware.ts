import { db } from "@/db";
import { portfolioTable } from "@/db/schema";
import { ServerFunctionResponse } from "@/types";
import { captureException } from "@/utils/posthog/helpers";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { createResponse } from ".";
import { NotFoundError, UnauthorizedError } from "./errors";

/**
 * Checks if user is authenticated
 */
export async function requireAuth(): Promise<string> {
  const { userId } = await auth();
  if (!userId) {
    throw new UnauthorizedError("User not authenticated");
  }
  return userId;
}

/**
 * Checks if the user owns the portfolio
 */
export async function withPortfolioOwnership(portfolioId: number, userId: string): Promise<void> {
  const cachedValidatePortfolioOwnership = unstable_cache(
    async (portfolioId: number, userId: string) => {
      const portfolio = await db
        .select({ id: portfolioTable.id })
        .from(portfolioTable)
        .where(and(eq(portfolioTable.id, portfolioId), eq(portfolioTable.userId, userId)))
        .limit(1)
        .then((rows) => rows[0]);

      if (!portfolio) {
        throw new NotFoundError("You do not own this portfolio");
      }
    },
    [`portfolio-ownership-${portfolioId}-${userId}`],
    {
      revalidate: 3600, // Cache for 1 hour (3600 seconds)
      tags: [`portfolio-ownership-${portfolioId}-${userId}`],
    }
  );

  await cachedValidatePortfolioOwnership(portfolioId, userId);
}

/**
 * Simple error wrapper
 */
export function withErrorHandling<T extends any[], R>(handler: (...args: T) => Promise<R>) {
  return async (...args: T): Promise<ServerFunctionResponse<R>> => {
    try {
      const result = await handler(...args);
      return createResponse.success("Operation completed successfully", result);
    } catch (error: any) {
      captureException(error);
      return createResponse.fromError(error);
    }
  };
}
