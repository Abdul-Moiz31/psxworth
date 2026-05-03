import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

const textareaVariants = cva(
  "block w-full text-sm text-foreground bg-transparent appearance-none focus:outline-none focus:ring-0 peer disabled:cursor-not-allowed disabled:opacity-50 resize-none",
  {
    variants: {
      variant: {
        filled: "rounded-t-lg px-2.5 pb-2.5 pt-5 border-0 border-b-2 border-input bg-muted/50 focus:border-primary",
        outlined: "rounded-lg px-2.5 pb-2.5 pt-4 border border-input focus:border-primary",
        standard: "py-2.5 px-0 border-0 border-b-2 border-input focus:border-primary",
      },
    },
    defaultVariants: {
      variant: "outlined",
    },
  }
);

const labelVariants = cva(
  "absolute text-sm text-muted-foreground duration-300 transform z-10 origin-[0] peer-focus:text-foreground",
  {
    variants: {
      variant: {
        filled:
          "start-2.5 top-4 -translate-y-4 scale-[0.8] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-[0.8] peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto",
        outlined:
          "start-1 top-2 -translate-y-4 scale-[0.8] bg-background px-2 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-[0.8] peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto",
        standard:
          "top-3 -z-10 origin-[0] -translate-y-6 scale-[0.8] peer-focus:start-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-[0.8] peer-focus:-translate-y-6 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto",
      },
    },
    defaultVariants: {
      variant: "outlined",
    },
  }
);

export interface FloatingLabelTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  label: string;
  isError?: boolean;
}

const FloatingLabelTextarea = React.forwardRef<HTMLTextAreaElement, FloatingLabelTextareaProps>(
  ({ className, variant, label, isError, id, ...props }, ref) => {
    const reactId = React.useId();
    const textareaId = id || reactId;

    return (
      <div className="relative w-full">
        <textarea
          id={textareaId}
          className={cn(
            textareaVariants({ variant, className }),
            isError && "border-destructive focus:border-destructive"
          )}
          placeholder=" "
          ref={ref}
          {...props}
        />
        <label
          htmlFor={textareaId}
          className={cn(labelVariants({ variant }), isError && "text-destructive peer-focus:text-destructive")}
        >
          {label}
        </label>
      </div>
    );
  }
);
FloatingLabelTextarea.displayName = "FloatingLabelTextarea";

export { FloatingLabelTextarea };
