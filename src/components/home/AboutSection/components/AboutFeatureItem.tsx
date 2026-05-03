"use client";

import clsx from "clsx";
import { motion, MotionValue, useTransform } from "motion/react";
import { useEffect, useState, useRef } from "react";

export const AboutFeatureItem = ({
  number,
  title,
  description,
  progress,
}: {
  number: string;
  title: string;
  description: string;
  progress: MotionValue<string>;
}) => {
  const [visibleChars, setVisibleChars] = useState<number>(0);
  const [contentHeight, setContentHeight] = useState<number>(0);
  const characters = description.split("");
  const visibleTextRef = useRef<HTMLParagraphElement>(null);

  // Convert string percentage to a number between 0-1
  const normalizedProgress = useTransform(progress, (value: string) => {
    // Remove the % and convert to number between 0-1
    return parseFloat(value) / 100;
  });

  useEffect(() => {
    // Subscribe to the normalized progress value (onChange is deprecated)
    const unsubscribe = normalizedProgress.on("change", (value) => {
      const calculatedChars = Math.ceil(characters.length * value);
      setVisibleChars(calculatedChars);
    });

    return () => unsubscribe();
  }, [normalizedProgress, characters.length]);

  // Update content height whenever visible characters change
  useEffect(() => {
    if (visibleTextRef.current) {
      setContentHeight(visibleTextRef.current.scrollHeight);
    }
  }, [visibleChars]);

  const isCurrentItemScrolling = visibleChars > 0 && visibleChars < characters.length;
  const isCurrentItemFullyVisible = visibleChars === characters.length;

  return (
    <motion.div
      className={clsx("flex items-start gap-4", isCurrentItemFullyVisible && "mb-2")}
      initial={{ opacity: 1 }}
    >
      <div className={`flex h-12 w-12 flex-shrink-0 justify-center rounded-xl pt-1`}>
        <span className={clsx("font-bold", isCurrentItemScrolling ? `text-blue-400` : "text-gray-100")}>{number}</span>
      </div>
      <div>
        <h3 className={clsx("mb-2 text-xl font-bold", isCurrentItemScrolling ? `text-blue-400` : "text-gray-100")}>
          {title}
        </h3>
        <div className="relative">
          {/* Animated container with smooth height transition */}
          <motion.div
            className="overflow-hidden"
            animate={{
              height: visibleChars === 0 ? 0 : contentHeight,
            }}
            transition={{
              duration: 0.3,
              ease: "easeInOut",
            }}
          >
            <p ref={visibleTextRef} className="text-lg text-slate-300">
              {characters.slice(0, visibleChars).join("")}
              {visibleChars < characters.length && !!visibleChars && (
                <motion.span
                  className="ml-1 inline-block h-4 w-[3px] bg-slate-300"
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                />
              )}
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
