"use client";

import { toast } from "@/components/molecules/Toast";
import { useState, useCallback } from "react";
import { formatTime } from "../helpers/helpers";

interface RateLimitState {
  isRateLimited: boolean;
  retryAfter: number;
  remainingAttempts: number;
}

export const useRateLimit = () => {
  const [rateLimitState, setRateLimitState] = useState<RateLimitState>({
    isRateLimited: false,
    retryAfter: 0,
    remainingAttempts: 0,
  });

  const handleRateLimitError = useCallback((error: any) => {
    // Check if the error is a rate limit error
    if (error?.message?.includes("Rate limit exceeded")) {
      const retryAfterMatch = error.message.match(/(\d+) seconds/);
      const retryAfter = retryAfterMatch ? parseInt(retryAfterMatch[1]) : 0;

      setRateLimitState({
        isRateLimited: true,
        retryAfter,
        remainingAttempts: 0,
      });

      toast({
        title: "Too many requests",
        description: `Please wait ${formatTime(retryAfter)} before trying again.`,
        type: "error",
      });

      // Auto-reset after the retry period
      setTimeout(() => {
        setRateLimitState({
          isRateLimited: false,
          retryAfter: 0,
          remainingAttempts: 0,
        });
      }, retryAfter * 1000);

      return true; // Indicates this was a rate limit error
    }

    return false; // Not a rate limit error
  }, []);

  const resetRateLimit = useCallback(() => {
    setRateLimitState({
      isRateLimited: false,
      retryAfter: 0,
      remainingAttempts: 0,
    });
  }, []);

  return {
    rateLimitState,
    handleRateLimitError,
    resetRateLimit,
  };
};
