"use client";

import { fadeIn } from "@/utils/constants/animationVariants";
import { motion, useInView, useAnimation } from "motion/react";
import { useRef, useEffect } from "react";
import { CTAContent } from "./components/CTAContent";
import { StockCard } from "./components/StockCard";

export const CTASection = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const controls = useAnimation();

  // Start animations when in view
  useEffect(() => {
    if (isInView) {
      controls.start("animate");
    }
  }, [isInView, controls]);

  return (
    <section className="relative overflow-hidden px-3 py-16 sm:px-6 md:px-12 md:py-24" ref={sectionRef}>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
        className="relative mx-auto max-w-7xl rounded-3xl border border-white/40 bg-card/50 p-8 backdrop-blur-md md:p-12"
      >
        <div className="grid items-center gap-8 md:grid-cols-2">
          <CTAContent isInView={isInView} />
          <StockCard isInView={isInView} />
        </div>
      </motion.div>
    </section>
  );
};
