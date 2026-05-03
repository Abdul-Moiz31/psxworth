"use client";

import { motion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { useRef } from "react";

export const HowItWorksDemoPreview = () => {
  const demoRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: demoRef,
    offset: ["start end", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 0.4], [0.85, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [0.4, 1]);
  const y = useTransform(scrollYProgress, [0, 0.4], [60, 0]);

  return (
    <motion.div
      ref={demoRef}
      style={{
        scale: scale as unknown as number,
        opacity: opacity as unknown as number,
        y: y as unknown as number,
      }}
      className="mt-20 will-change-transform"
    >
      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-b from-slate-700/50 to-slate-700/50 p-1">
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-purple-600/10 blur-xl" />
        <div className="relative aspect-[16/8] w-full overflow-hidden rounded-xl bg-slate-900">
          <Image
            src="/home/dashboard-demo.png"
            alt="Dashboard demo preview"
            fill
            sizes="100vw"
            className="object-fill"
            priority
          />
        </div>
      </div>
    </motion.div>
  );
};
