"use client";

import { useState, useEffect } from "react";

export const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState<
    "small" | "medium" | "large" | "extraLarge"
  >(() => {
    if (typeof window !== "undefined") {
      const width = window.innerWidth;
      if (width < 640) return "small";
      if (width < 768) return "medium";
      if (width < 1024) return "large";
      return "extraLarge";
    }
    return "large";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleResize = () => {
        const width = window.innerWidth;
        if (width < 640) {
          setBreakpoint("small");
        } else if (width < 768) {
          setBreakpoint("medium");
        } else if (width < 1024) {
          setBreakpoint("large");
        } else {
          setBreakpoint("extraLarge");
        }
      };

      handleResize();
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }
  }, []);

  return {
    isSmall: breakpoint === "small",
    isMedium: breakpoint === "medium",
    isLarge: breakpoint === "large",
    isExtraLarge: breakpoint === "extraLarge",
  };
};

export default useBreakpoint;
