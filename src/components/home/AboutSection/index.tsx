"use client";

import { fadeIn } from "@/utils/constants/animationVariants";
import { motion, useMotionValue, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { AboutFeatureList } from "./components/AboutFeatureList";
import { AboutHeader } from "./components/AboutHeader";
import { EnhancedCard } from "./components/EnhancedCard";

// Main AboutSection component
export const AboutSection = () => {
  const itemsContainerRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: itemsContainerRef,
    offset: ["start end", "end end"],
  });

  // Create scroll-linked progress values for each item
  const item1Progress = useTransform(scrollYProgress, [0.15, 0.5], ["0%", "100%"]);
  const item2Progress = useTransform(scrollYProgress, [0.5, 0.75], ["0%", "100%"]);
  const item3Progress = useTransform(scrollYProgress, [0.7, 1], ["0%", "100%"]);
  const fallbackProgress = useMotionValue("100%");

  // Compute isMobile only after mount to avoid SSR/CSR mismatch
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth < 768);
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);
  return (
    <section id="about" className="relative py-16 md:py-24">
      <div className="md:sticky md:top-8">
        <div className="relative z-10 mx-auto max-w-7xl px-3 sm:px-6 md:px-12">
          {/* Section header */}
          <AboutHeader />

          <div className="grid items-center gap-12 md:grid-cols-2">
            {/* Left column with card */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeIn}
              className="relative"
            >
              <div className="h-full w-full overflow-hidden rounded-2xl md:p-8">
                <EnhancedCard />
              </div>
            </motion.div>

            {/* Right column with features */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeIn}
              className="sticky md:static top-20 flex flex-col gap-8"
            >
              <h2 className="text-3xl font-bold md:text-4xl">
                <span className="text-gray-100">Redefining </span>
                <span className="text-blue-400">Investment Tracking</span>
              </h2>

              <p className="text-lg text-slate-300">
                PsxWorth is built to empower Pakistani investors with tools that provide accurate insights into
                investment performance. It&apos;s <span className="font-semibold">free</span> with
                <span className="font-semibold"> no ads</span>.
              </p>

              {/* Features list */}
              <AboutFeatureList
                item1Progress={isMobile ? fallbackProgress : item1Progress}
                item2Progress={isMobile ? fallbackProgress : item2Progress}
                item3Progress={isMobile ? fallbackProgress : item3Progress}
              />
            </motion.div>
          </div>
        </div>
      </div>
      {/* This div is used to scroll the descirption of features */}
      {!isMobile && <div className="relative h-[2000px]" ref={itemsContainerRef} />}
    </section>
  );
};

export default AboutSection;
