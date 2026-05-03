"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

export function HeroDashboardPreview() {
  const dashboardRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: dashboardRef,
    offset: ["start end", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 0.4], [0.85, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [0.4, 1]);
  const y = useTransform(scrollYProgress, [0, 0.4], [60, 0]);

  return (
    <motion.div
      ref={dashboardRef}
      style={{
        scale: scale as unknown as number,
        opacity: opacity as unknown as number,
        y: y as unknown as number,
      }}
      className="relative mx-auto mt-16 max-w-7xl will-change-transform"
    >
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-slate-800/50 to-slate-900/50 shadow-2xl backdrop-blur-sm">
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-purple-600/20 blur-xl" />
        <div className="relative w-full overflow-hidden bg-slate-900" style={{ height: 0, paddingBottom: "60.6%" }}>
          <iframe
            src="https://www.youtube.com/embed/yzfauih5xKQ?rel=0&modestbranding=1"
            title="PsxWorth walkthrough video"
            className="absolute left-0 top-0 block h-full w-full overflow-hidden border-0 align-top"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>
    </motion.div>
  );
}
