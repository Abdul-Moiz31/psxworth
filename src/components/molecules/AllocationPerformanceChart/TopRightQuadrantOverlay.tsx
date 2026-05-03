"use client";

import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";

export interface TopRightQuadrantOverlayProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  centerX: number;
  centerY: number;
  notifyToken?: number;
}

export const TopRightQuadrantOverlay = ({
  containerRef,
  xMin,
  xMax,
  yMin,
  yMax,
  centerX,
  centerY,
  notifyToken = 0,
}: TopRightQuadrantOverlayProps) => {
  const [rect, setRect] = useState<{ left: number; top: number; width: number; height: number } | null>(null);

  const ratios = useMemo(() => {
    const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
    return {
      x: clamp01((centerX - xMin) / (xMax - xMin || 1)),
      y: clamp01((yMax - centerY) / (yMax - yMin || 1)),
    };
  }, [centerX, xMin, xMax, centerY, yMax, yMin]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const update = () => {
      try {
        const gridEl = container.querySelector(".apexcharts-grid") as HTMLElement | null;
        if (!gridEl) return;

        const gridRect = gridEl.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        const centerXPx = gridRect.left + gridRect.width * ratios.x;
        const centerYPx = gridRect.top + gridRect.height * ratios.y;

        const left = centerXPx - containerRect.left;
        const top = gridRect.top - containerRect.top;
        const width = gridRect.right - centerXPx;
        const height = centerYPx - gridRect.top;

        if (width > 0 && height > 0) setRect({ left, top, width, height });
        else setRect(null);
      } catch {
        // ignore
      }
    };

    update();

    const obs = new ResizeObserver(update);
    obs.observe(container);
    return () => obs.disconnect();
  }, [containerRef, ratios, notifyToken]);

  if (!rect) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute rounded-sm z-10"
      initial={false}
      animate={{
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      }}
      transition={{ type: "spring", stiffness: 400, damping: 40, mass: 0.6 }}
      style={{
        background: "linear-gradient(135deg, rgba(16,185,129,0.18), rgba(16,185,129,0.10))",
        boxShadow: "inset 0 0 0 1px rgba(16,185,129,0.25)",
      }}
    />
  );
};

export default TopRightQuadrantOverlay;
