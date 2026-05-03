"use client";

import { Target } from "lucide-react";
import { motion } from "motion/react";
import AddPortfolioButton from "./AddPortfolioButton";

interface EmptyStateProps {
  onCreatePortfolio: () => void;
}

const EmptyState = ({ onCreatePortfolio }: EmptyStateProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
      className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-blue-500/5 to-purple-600/5 p-8 text-center backdrop-blur-sm"
    >
      <motion.div
        className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-600/20 to-purple-700/20 text-3xl"
        animate={{
          scale: [1, 1.03, 1],
          rotate: [0, 1, -1, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      >
        <Target size={32} className="text-blue-400" strokeWidth={1.5} />
      </motion.div>

      <motion.h3
        className="mb-2 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-xl font-bold text-transparent"
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{ backgroundSize: "200% 200%" }}
      >
        Start Your Investment Journey
      </motion.h3>

      <p className="mb-6 text-gray-300">
        Your portfolio list is looking a bit empty. Create your first portfolio
        to start tracking your investments.
      </p>

      <AddPortfolioButton onClick={onCreatePortfolio} />
    </motion.div>
  );
};

export default EmptyState;
