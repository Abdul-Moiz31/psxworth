import { cn } from "@/lib/utils";
import * as React from "react";
import { twMerge } from "tailwind-merge";

const Progress = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: number; progressColor?: string }
>(({ className, value, progressColor, ...props }, ref) => (
  <div ref={ref} className={cn("relative h-2 w-full overflow-hidden rounded-full bg-primary/20", className)} {...props}>
    <div
      className={twMerge(`h-full w-full flex-1 bg-blue-600 transition-all`, progressColor)}
      style={{
        transform: `translateX(-${100 - (value || 0)}%)`,
      }}
    />
  </div>
));
Progress.displayName = "Progress";

export { Progress };
