import { Button } from "@/components/ui/button";
import { fadeIn, slideInFromBottom } from "@/utils/constants/animationVariants";
// For SSR support
import * as motion from "motion/react-client";

export const HeroText = () => {
  return (
    <motion.div initial="hidden" animate="visible" variants={fadeIn}>
      <motion.h1
        id="hero-title"
        className="mb-6 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl"
        initial={{ filter: "blur(3px)" }}
        animate={{ filter: "blur(0px)" }}
        transition={{ duration: 1.2 }}
      >
        Best{" "}
        <span className="text-blue-400">
          {" "}
          PSX Portfolio
        </span>{" "}
        Tracker
      </motion.h1>
      <motion.p
        id="hero-description"
        className="mb-8 text-lg text-slate-300"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        Pakistan Stock Exchange (PSX) portfolio tracking made simple with PsxWorth. Import transactions, track
        dividends, review holdings, and view sector allocation.
      </motion.p>

      <motion.div variants={slideInFromBottom}>
        <Button asChild size="lg" className="px-8 py-3 text-lg font-medium">
          <a href="/portfolio" aria-label="Start tracking your portfolio">
            Start Tracking Free
          </a>
        </Button>
      </motion.div>

      <motion.p
        className="mt-3 text-sm text-slate-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        Free. No ads. No credit card required.
      </motion.p>
    </motion.div>
  );
};
