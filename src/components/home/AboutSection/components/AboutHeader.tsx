"use client";

import { motion } from "motion/react";
import { AnimatedText } from "./AnimatedText";

export const AboutHeader = () => (
  <div className="md-4 md:mb-8 text-center">
    <motion.span
      initial={{ opacity: 0, y: -10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="mb-4 inline-block rounded-full border border-blue-400/30 bg-blue-400/5 px-4 py-1 text-sm uppercase tracking-widest text-blue-400"
    >
      About Us
    </motion.span>
    <h2 className="mb-6 text-3xl font-bold leading-tight md:text-5xl">
      <span className="block">The Story Behind</span>
      <AnimatedText
        text="PsxWorth"
        className="text-blue-400"
      />
    </h2>
  </div>
);
