"use client";

import { setLastActivePortfolioCookie, deleteLastActivePortfolioCookie } from "@/actions/cookies/lastActivePortfolio";
import { useEffect } from "react";

interface Props {
  portfolioId?: number;
  shouldDelete?: boolean;
}

/**
 * This component handles portfolio cookie operations on the client side.
 * It uses server actions to set or delete cookies, which is the proper way to handle
 * HTTP-only cookies in Next.js.
 */
export function PortfolioCookieSetter({ portfolioId, shouldDelete = false }: Props) {
  useEffect(() => {
    if (shouldDelete) {
      // Delete the cookie when needed (for error cases)
      deleteLastActivePortfolioCookie();
    } else if (portfolioId) {
      // Set the cookie when the component mounts
      setLastActivePortfolioCookie(portfolioId);
    }
  }, [portfolioId, shouldDelete]);

  // This component doesn't render anything
  return null;
}
