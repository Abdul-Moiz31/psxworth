"use client";

import Spacer from "@/components/ui/Spacer";
import GradientButton from "@/components/ui/gradient-button";
import { motion } from "motion/react";

interface AddPortfolioButtonProps {
  onClick: () => void;
}

const AddPortfolioButton = ({ onClick }: AddPortfolioButtonProps) => {
  return (
    <div className="mt-2">
      <Spacer size={32} />
      <motion.div
        className="absolute bottom-0 left-0 right-0 overflow-hidden rounded-b-xl"
        initial={{ opacity: 0.9 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.1 }}
      >
        <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm" />

        <div className="relative z-10 p-2 pt-3 scale-95">
          <GradientButton onClick={onClick} fullWidth>
            Add New Portfolio
          </GradientButton>
        </div>
      </motion.div>
    </div>
  );
};

export default AddPortfolioButton;
