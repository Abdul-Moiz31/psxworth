"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface HideOnScrollProps {
  visible: boolean;
  children: ReactNode;
  className?: string;
}

export const HideOnScroll = ({ visible, children, className }: HideOnScrollProps) => {
  return (
    <div
      className={cn(
        "transition-all duration-200",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
        className
      )}
    >
      {children}
    </div>
  );
};

export default HideOnScroll;

