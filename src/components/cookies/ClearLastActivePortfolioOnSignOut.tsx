"use client";

import { deleteLastActivePortfolioCookie } from "@/actions/cookies/lastActivePortfolio";
import { useAuth } from "@clerk/nextjs";
import { useEffect, useRef } from "react";

/**
 * Deletes the lastActivePortfolio cookie when a signed-in user signs out,
 * preventing cross-account leakage on shared devices.
 */
export function ClearLastActivePortfolioOnSignOut() {
  const { isSignedIn } = useAuth();
  const wasSignedIn = useRef<boolean>(isSignedIn);

  useEffect(() => {
    const signedOut = wasSignedIn.current && !isSignedIn;
    wasSignedIn.current = isSignedIn;

    if (signedOut) {
      deleteLastActivePortfolioCookie();
    }
  }, [isSignedIn]);

  return null;
}
