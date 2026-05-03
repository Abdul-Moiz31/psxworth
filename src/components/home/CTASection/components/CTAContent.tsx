"use client";

import { Button } from "@/components/ui/button";
import * as motion from "motion/react-client";

interface CTAContentProps {
  isInView: boolean;
}
export const CTAContent = (props: CTAContentProps) => {
  const { isInView } = props;
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
  };

  const buttonVariants = {
    idle: { scale: 1 },
    hover: {
      transition: { type: "spring", stiffness: 400, damping: 10 },
    },
    tap: { scale: 1 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="relative"
    >
      <motion.h2 variants={itemVariants} className="relative mb-6 text-3xl font-bold md:text-4xl">
        Ready to track your PSX Portfolio for free?
      </motion.h2>
      <motion.p variants={itemVariants} className="mb-8 text-slate-300">
        Join investors across Pakistan making smarter decisions with PsxWorth&apos;s advanced tracking and analytics.
        <span className="font-semibold"> Free with no ads</span>.
      </motion.p>
      <motion.div variants={itemVariants}>
        <motion.div
          variants={buttonVariants}
          initial="idle"
          whileHover="hover"
          whileTap="tap"
          className="w-fit rounded-full bg-transparent"
        >
          <Button asChild size="lg" className="px-8 py-3 text-lg font-medium">
            <a href="/portfolio/" aria-label="Get started tracking your portfolio">
              Get Started Free
            </a>
          </Button>
        </motion.div>
      </motion.div>
      <motion.p variants={itemVariants} className="mt-3 text-sm text-slate-400">
        Free. No ads. No credit card required.
      </motion.p>
    </motion.div>
  );
};
