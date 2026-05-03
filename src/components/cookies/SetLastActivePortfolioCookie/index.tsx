"use client";

import { setLastActivePortfolioCookie } from "@/actions/cookies/lastActivePortfolio";
import { useEffect, useRef } from "react";

interface Props {
  lastActivePortfolioId: number;
}

/**
 * This component is used to set the last active portfolio cookie.
 * It is a workaround to trigger the cookie setting function.
 * Since https cookies can be set only through Server Action or a route handler.
 * This component is a workaround to trigger the cookie setting function.
 * @returns
 */
export function SetLastActivePortfolioCookie(props: Props) {
  const { lastActivePortfolioId } = props;
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    ref.current?.click();
  }, []);

  return <input type="hidden" ref={ref} onClick={() => setLastActivePortfolioCookie(lastActivePortfolioId)} />;
}

export default SetLastActivePortfolioCookie;
