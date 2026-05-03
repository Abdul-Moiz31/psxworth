"use server";

import { cookies } from "next/headers";

export const setLastActivePortfolioCookie = async (portfolioId: number) => {
  "use server";
  try {
    if (!Number.isFinite(portfolioId) || portfolioId <= 0) return;
    const cookieStore = await cookies();

    cookieStore.set({
      name: "lastActivePortfolio",
      value: portfolioId.toString(),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  } catch (error) {
    // Swallow errors to avoid impacting UX; log for observability
    console.error("Failed to set lastActivePortfolio cookie", error);
  }
};

export const deleteLastActivePortfolioCookie = async () => {
  "use server";
  try {
    const cookieStore = await cookies();
    cookieStore.delete("lastActivePortfolio");
  } catch (error) {
    console.error("Failed to delete lastActivePortfolio cookie", error);
  }
};
