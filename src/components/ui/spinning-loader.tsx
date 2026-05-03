"use client";

import { cva } from "class-variance-authority";
import clsx from "clsx";

// Define loader variants using CVA
const loaderVariants = cva(
  // Base classes that are always applied
  "rounded-full",
  {
    variants: {
      size: {
        xxs: "w-4 h-4 border-2",
        xs: "w-6 h-6 border-2",
        sm: "w-8 h-8 border-4",
        md: "w-12 h-12 border-4",
        lg: "w-16 h-16 border-4",
        xl: "w-24 h-24 border-8",
      },
      color: {
        blue: "border-gray-200 border-t-blue-500",
        orange: "border-gray-200 border-t-orange-600",
        green: "border-gray-200 border-t-green-500",
        purple: "border-gray-200 border-t-purple-600",
        red: "border-gray-200 border-t-red-600",
        gray: "border-gray-200 border-t-gray-600",
        primary: "border-gray-200 border-t-blue-600",
      },
      speed: {
        slow: "animate-spin",
        normal: "animate-spin",
        fast: "animate-spin",
      },
    },
    // Default variants
    defaultVariants: {
      size: "sm",
      color: "blue",
      speed: "normal",
    },
  }
);

interface SpinningLoaderProps {
  size?: "xxs" | "xs" | "sm" | "md" | "lg" | "xl";
  color?: "blue" | "orange" | "green" | "purple" | "red" | "gray" | "primary";
  speed?: "slow" | "normal" | "fast";
  text?: string | null;
  className?: string;
  fullScreen?: boolean;
}

export const SpinningLoader = (props: SpinningLoaderProps) => {
  const {
    size = "sm",
    color = "blue",
    speed = "fast",
    text = null,
    className = "",
    fullScreen = false,
  } = props;

  // Get speed-specific duration style
  const getSpeedStyle = (speed: string) => {
    switch (speed) {
      case "slow":
        return { animationDuration: "1.3s" };
      case "fast":
        return { animationDuration: "0.6s" };
      default:
        return { animationDuration: "1s" };
    }
  };

  const loaderElement = (
    <div
      className={clsx(
        "relative  flex flex-col justify-center items-center",
        className
      )}
    >
      <div
        className={loaderVariants({ size, color, speed })}
        style={getSpeedStyle(speed)}
      />
      {text && (
        <p className="mt-3 text-gray-300 animate-pulse text-center">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        {loaderElement}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center">
      {loaderElement}
    </div>
  );
};

export default SpinningLoader;
