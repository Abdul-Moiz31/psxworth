"use client";

import { RefObject, useEffect, useRef, useState } from "react";

export type ScrollDirection = "up" | "down";

interface UseScrollDirectionOptions {
  threshold?: number;
  initialDirection?: ScrollDirection;
}

const getScrollTop = (target: HTMLElement) => target.scrollTop;

export const useScrollDirection = (
  targetRef: RefObject<HTMLElement | null> | null,
  options: UseScrollDirectionOptions = {}
) => {
  const { threshold = 10, initialDirection = "up" } = options;
  const [direction, setDirection] = useState<ScrollDirection>(initialDirection);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollTopRef = useRef(0);

  useEffect(() => {
    const target = targetRef?.current;
    if (!target) return;

    lastScrollTopRef.current = getScrollTop(target);

    const handleScroll = () => {
      const nextScrollTop = getScrollTop(target);
      const delta = nextScrollTop - lastScrollTopRef.current;

      if (Math.abs(delta) < threshold) return;

      if (delta > 0) {
        setDirection("down");
        setIsVisible(false);
      } else {
        setDirection("up");
        setIsVisible(true);
      }

      lastScrollTopRef.current = nextScrollTop;
    };

    target.addEventListener("scroll", handleScroll, { passive: true });
    return () => target.removeEventListener("scroll", handleScroll);
  }, [targetRef, threshold]);

  return { direction, isVisible };
};
