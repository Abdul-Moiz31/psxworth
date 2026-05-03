"use client";

import { deleteLastActivePortfolioCookie } from "@/actions/cookies/lastActivePortfolio";
import { useEffect, useRef } from "react";

/**
 * This component is used to delete the last active portfolio cookie.
 * It is a workaround to trigger the cookie setting function.
 * Since https cookies can be set only through Server Action or a route handler.
 * This component is a workaround to trigger the cookie setting function.
 * @returns
 */
export function DeleteLastActivePortfolioCookie() {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    ref.current?.click();
  }, []);

  return (
    <input
      type="hidden"
      ref={ref}
      onClick={() => deleteLastActivePortfolioCookie()}
    />
  );
}

export default DeleteLastActivePortfolioCookie;
