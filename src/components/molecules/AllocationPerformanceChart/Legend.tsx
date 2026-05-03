"use client";

import { AnimateChangeInHeight } from "@/components/molecules/AnimateChangeInHeight";
import { AnimatePresence, motion } from "motion/react";
import type { ScatterPoint } from "./types";

export interface LegendProps {
  points: ScatterPoint[];
  seriesColors: string[];
}

export const Legend = ({ points, seriesColors }: LegendProps) => {
  if (!points || points.length === 0) return null;

  return (
    <AnimateChangeInHeight className="mb-4 rounded-lg">
      <motion.div
        className="p-3 bg-slate-800/50 border border-slate-700 border-x-0 overflow-hidden"
        layout
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 40, mass: 0.6 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-3.5 h-3.5 rounded-sm border border-emerald-500 bg-emerald-500/20" />
          <span className="text-sm text-slate-300">Top-right quadrant is most desired</span>
        </div>
        <motion.div className="flex flex-wrap gap-x-4 gap-y-2" layout>
          <AnimatePresence initial={false} mode="popLayout">
            {points.map((point, idx) => (
              <motion.div
                key={point.name}
                layout
                initial={{ opacity: 0, scale: 0.95, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -6 }}
                transition={{ type: "spring", stiffness: 600, damping: 36, mass: 0.5 }}
                className="flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
              >
                <motion.div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  animate={{ backgroundColor: seriesColors[idx % seriesColors.length] }}
                  transition={{ duration: 0.25 }}
                />
                <span className="text-sm text-slate-300 truncate max-w-[150px]" title={point.name}>
                  {point.name}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimateChangeInHeight>
  );
};

export default Legend;
