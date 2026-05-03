"use client";

import posthog from "posthog-js";
import { useEffect } from "react";

export default function Error({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    posthog.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center">
      <h2 className="text-2xl font-semibold text-red-400">
        Something went wrong!
      </h2>
      <p className="text-gray-600">Please try again later.</p>
      {/* Display the error message for debugging */}
      <p className="text-sm text-gray-400 mt-2">{error.message}</p>
    </div>
  );
}
