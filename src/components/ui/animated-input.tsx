"use client";

import { motion, AnimatePresence } from "motion/react";
import { Input } from "./input";

interface AnimatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  animatedPlaceholder?: string;
}

export function AnimatedInput({ animatedPlaceholder, className, ...props }: AnimatedInputProps) {
  const placeholder = animatedPlaceholder || props.placeholder || "";

  return (
    <div className="relative">
      <Input className={className} {...props} placeholder="" />

      <div className="absolute inset-0 flex items-center pointer-events-none">
        <div className="pl-3 overflow-hidden text-slate-500">
          <AnimatePresence mode="wait">
            <motion.span
              key={placeholder}
              className="block"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {!props.value && placeholder}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
