"use client";

import { Check } from "lucide-react";
import * as React from "react";
import { useState, useEffect, useRef } from "react";

interface HoldToConfirmButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  onConfirm?: () => void;
  holdDuration?: number;
  variant?: "primary" | "secondary" | "success" | "danger" | "warning";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string;
}

export const HoldToConfirmButton = ({
  children = "Hold to Confirm",
  onConfirm,
  holdDuration = 2000,
  variant = "primary",
  size = "md",
  disabled = false,
  className = "",
  ...props
}: HoldToConfirmButtonProps) => {
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const holdTimerRef = useRef<number | null>(null);
  const progressTimerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const variantStyles = {
    primary: {
      background: "bg-primary",
      hover: "hover:bg-primary/90",
      text: "text-primary-foreground",
      progress: "bg-primary-foreground/20",
      progressFill: "bg-primary-foreground/40",
    },
    secondary: {
      background: "bg-secondary",
      hover: "hover:bg-secondary/80",
      text: "text-secondary-foreground",
      progress: "bg-secondary-foreground/20",
      progressFill: "bg-secondary-foreground/40",
    },
    success: {
      background: "bg-green-600",
      hover: "hover:bg-green-700",
      text: "text-gray-100",
      progress: "bg-white/20",
      progressFill: "bg-white/40",
    },
    danger: {
      background: "bg-red-600",
      hover: "hover:bg-red-700",
      text: "text-gray-100",
      progress: "bg-white/20",
      progressFill: "bg-white/40",
    },
    warning: {
      background: "bg-amber-500",
      hover: "hover:bg-amber-600",
      text: "text-gray-100",
      progress: "bg-white/20",
      progressFill: "bg-white/40",
    },
  };

  const sizeStyles = {
    sm: "text-sm px-3 py-2 h-9",
    md: "text-sm px-4 py-2 h-10",
    lg: "text-base px-6 py-3 h-11",
  };

  const currentVariant = variantStyles[variant];
  const currentSize = sizeStyles[size];

  const startHold = () => {
    if (disabled || isConfirmed) return;

    setIsHolding(true);
    setProgress(0);
    startTimeRef.current = Date.now();

    // Progress animation
    const updateProgress = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const newProgress = Math.min((elapsed / holdDuration) * 100, 100);
      setProgress(newProgress);

      if (newProgress < 100) {
        progressTimerRef.current = window.setTimeout(updateProgress, 16);
      }
    };

    updateProgress();

    // Hold completion timer
    holdTimerRef.current = window.setTimeout(() => {
      setIsConfirmed(true);
      setIsHolding(false);
      onConfirm?.();

      // Reset after showing confirmation
      window.setTimeout(() => {
        setIsConfirmed(false);
        setProgress(0);
      }, 1000);
    }, holdDuration);
  };

  const stopHold = () => {
    if (isConfirmed) return;

    setIsHolding(false);
    setProgress(0);

    if (holdTimerRef.current) {
      window.clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }

    if (progressTimerRef.current) {
      window.clearTimeout(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
      if (progressTimerRef.current) clearTimeout(progressTimerRef.current);
    };
  }, []);

  return (
    <button
      className={`
        relative overflow-hidden rounded-md font-medium transition-all duration-200
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
        disabled:pointer-events-none disabled:opacity-50
        ${currentVariant.background} ${currentVariant.hover} ${currentVariant.text}
        ${currentSize} ${className}
        ${isHolding ? "scale-95" : "scale-100"}
        ${isConfirmed ? "bg-green-600" : ""}
      `}
      disabled={disabled}
      onMouseDown={startHold}
      onMouseUp={stopHold}
      onMouseLeave={stopHold}
      onTouchStart={startHold}
      onTouchEnd={stopHold}
      {...props}
    >
      {/* Progress background */}
      <div className={`absolute inset-0 ${currentVariant.progress}`} />

      {/* Progress fill */}
      <div
        className={`absolute inset-0 ${currentVariant.progressFill} transition-all duration-75 ease-out`}
        style={{
          width: `${progress}%`,
        }}
      />

      {/* Content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {isConfirmed ? (
          <>
            <Check size={16} />
            Confirmed!
          </>
        ) : (
          children
        )}
      </span>

      {/* Pulse effect when holding */}
      {isHolding && <div className="absolute inset-0 animate-pulse bg-white/10 rounded-md" />}
    </button>
  );
};

const HoldToConfirmDemo = () => {
  const [lastAction, setLastAction] = useState<string>("");

  return (
    <div className="flex flex-col items-center gap-6 p-8 bg-background rounded-lg">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-foreground">Hold to Confirm Button</h3>
        <p className="text-sm text-muted-foreground">Press and hold the button to confirm the action</p>
      </div>

      <div className="flex flex-wrap gap-4 justify-center">
        <HoldToConfirmButton variant="primary" onConfirm={() => setLastAction("Primary action confirmed!")}>
          Hold to Save
        </HoldToConfirmButton>

        <HoldToConfirmButton
          variant="danger"
          onConfirm={() => setLastAction("Delete action confirmed!")}
          holdDuration={1500}
        >
          Hold to Delete
        </HoldToConfirmButton>

        <HoldToConfirmButton variant="success" size="lg" onConfirm={() => setLastAction("Success action confirmed!")}>
          Hold to Submit
        </HoldToConfirmButton>

        <HoldToConfirmButton
          variant="warning"
          size="sm"
          onConfirm={() => setLastAction("Warning action confirmed!")}
          holdDuration={3000}
        >
          Hold to Reset
        </HoldToConfirmButton>
      </div>

      {lastAction && (
        <div className="text-center p-3 bg-muted rounded-md">
          <p className="text-sm text-muted-foreground">{lastAction}</p>
        </div>
      )}
    </div>
  );
};

export default HoldToConfirmDemo;
