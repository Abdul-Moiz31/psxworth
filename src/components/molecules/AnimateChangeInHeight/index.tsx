"use client";

import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import React, { useEffect, useRef, useState } from "react";

/**
 * Animates the height of a component when its content changes.
 *
 * @remarks
 *
 * This component uses a `ResizeObserver` to detect changes in the height of its children.
 * When the height changes, the component will animate from the old height to the new height.
 *
 * */
export function AnimateChangeInHeight(
  props: React.ComponentPropsWithRef<typeof motion.div> & { children: React.ReactNode }
) {
  const { children, className, ...restProps } = props;
  const [height, setHeight] = useState<number | "auto">("auto");
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = contentRef.current;
    if (!element) return;

    const updateHeight = () => {
      setHeight(element.getBoundingClientRect().height);
    };

    updateHeight();

    const resizeObserver = new ResizeObserver(([entry]) => {
      setHeight(entry.contentRect.height);
    });

    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <motion.div
      className={cn(className, "overflow-hidden")}
      style={{ height }}
      animate={{ height }}
      initial={false}
      transition={{ duration: 0.2 }}
      {...restProps}
    >
      <div ref={contentRef}>{children}</div>
    </motion.div>
  );
}
