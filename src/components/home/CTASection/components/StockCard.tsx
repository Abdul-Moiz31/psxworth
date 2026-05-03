"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { StockItem } from "./StockItem";

// Stock card component
export const StockCard = ({ isInView }: { isInView: boolean }) => {
  const [isHovered, setIsHovered] = useState(false);

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

  const cardVariants = {
    idle: { rotate: 0, scale: 1 },
    hover: {
      rotate: 0,
      scale: 1.02,
      transition: { type: "spring", stiffness: 300, damping: 15 },
    },
  };

  return (
    <div className="relative">
      <motion.div
        className="absolute inset-0 rotate-3 scale-105 rounded-2xl bg-muted/30"
        animate={{
          rotate: isHovered ? -0 : 3,
          scale: isHovered ? 1.02 : 1.05,
          transition: { duration: 0.4 },
        }}
      />
      <motion.div
        className="relative rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm"
        variants={cardVariants}
        initial="idle"
        whileHover="hover"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="relative z-10"
        >
          {/* Stock Items */}
          <StockItem name="OGDC" profit="+12.5%" isPositive={true} animationDelay={0.3} width={75} />
          <StockItem name="PSO" profit="+8.3%" isPositive={true} animationDelay={0.5} width={50} />
          <StockItem name="LUCK" profit="-2.1%" isPositive={false} animationDelay={0.7} width={25} />
        </motion.div>
      </motion.div>
    </div>
  );
};
