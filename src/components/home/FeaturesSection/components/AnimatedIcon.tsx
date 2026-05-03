"use client";

import { Icon } from "@/components/ui/icon";
import { motion } from "motion/react";
import type { Variants } from "motion/react";

interface AnimatedIconProps {
  path: React.ReactNode;
  gradient: string;
  size?: number;
  animation?: Variants;
  animateOnHoverOnly?: boolean;
}

export default function AnimatedIcon({
  path,
  gradient,
  size = 22,
  animation,
  animateOnHoverOnly = true,
}: AnimatedIconProps) {
  if (!animation) {
    return (
      <div
        className={`relative z-10 mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}
      >
        <Icon path={path} size={size} className="text-gray-100" />
      </div>
    );
  }

  const variants = animation as Variants;

  return (
    <motion.div
      className={`relative z-10 mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}
      variants={variants}
      initial="initial"
      animate={animateOnHoverOnly ? "initial" : "animate"}
      whileHover={animateOnHoverOnly ? "animate" : undefined}
      style={{ originX: 0.5, originY: 0.5 }}
    >
      <Icon path={path} size={size} className="text-gray-100" />
    </motion.div>
  );
}
