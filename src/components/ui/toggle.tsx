"use client";

import { cn } from "@/lib/utils";
import * as motion from "motion/react-client";
import { useId } from "react";

export interface ToggleProps {
  checked?: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  checkedLabel?: React.ReactNode;
  uncheckedLabel?: React.ReactNode;
  checkedIcon?: React.ReactNode;
  uncheckedIcon?: React.ReactNode;
  className?: string;
}

export const Toggle = (props: ToggleProps) => {
  "use no memo";
  const { checked, onChange, disabled, className, checkedLabel, uncheckedLabel, checkedIcon, uncheckedIcon } = props;

  const id = useId();

  return (
    <div className={cn("bg-slate-700 rounded-lg p-0.5 w-full isolate h-9", disabled && "opacity-60", className)}>
      <div className="bg-slate-700 rounded-md space-x-1 flex items-center h-full">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(false)}
          className="relative h-8 px-3 rounded-md transition-all flex justify-center items-center gap-2 hover:ring-1 hover:ring-slate-500 flex-1"
        >
          {/* Active background */}
          {!checked && (
            <motion.span
              className="absolute inset-0 bg-slate-600 rounded-md"
              layoutId={`${id}-toggle-bg`}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
            />
          )}

          <div className="relative z-10 flex items-center justify-center gap-2">
            <div className="hidden md:block">{uncheckedIcon ? uncheckedIcon : null}</div>
            <span className="text-sm font-medium">{uncheckedLabel}</span>
          </div>
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(true)}
          className="relative h-8 px-3 rounded-md flex items-center justify-center gap-2 hover:ring-1 hover:ring-slate-500 flex-1"
        >
          {/* Active background */}
          {checked && (
            <motion.span
              className="absolute inset-0 bg-slate-600 rounded-md"
              layoutId={`${id}-toggle-bg`}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
            />
          )}

          <div className="relative z-10 flex items-center justify-between gap-2">
            <div className="hidden sm:block">{checkedIcon ? checkedIcon : null}</div>
            <span className="text-sm font-medium whitespace-nowrap">{checkedLabel}</span>
          </div>
        </button>
      </div>
    </div>
  );
};
