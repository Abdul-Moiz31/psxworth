"use client";

import { Button } from "@/components/ui/button";
import { ButtonProps } from "@/components/ui/button";
import { SparklesIcon } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

interface AnimatedSecondaryButtonProps extends ButtonProps {
  children: React.ReactNode;
}

export const AnimatedSecondaryButton = ({
  children,
  className,
  ...props
}: AnimatedSecondaryButtonProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Button
        variant="secondary"
        className={`group relative overflow-hidden px-8 py-3 text-lg font-medium text-slate-200 ${className || ""}`}
        {...props}
      >
        {/* Animated dark slate background */}
        <motion.div
          className="absolute inset-0 rounded-md"
          style={{
            background: "linear-gradient(120deg, #0f172a, #1e293b, #334155)",
            backgroundSize: "200% 200%",
            opacity: 1,
            zIndex: 0,
          }}
          animate={{
            backgroundPosition: isHovered ? ["0% 0%", "100% 100%"] : "0% 0%",
          }}
          transition={{
            duration: 2,
            repeat: isHovered ? Infinity : 0,
            repeatType: "reverse",
          }}
        />

        <motion.span className="relative z-10 flex items-center gap-2">
          {children}
          {/* Sparkle icon that appears on hover */}
          <motion.div
            initial={{ opacity: 0, scale: 0, rotate: 0 }}
            animate={{
              opacity: isHovered ? [0, 1, 0] : 0,
              scale: isHovered ? [0, 1, 0] : 0,
              rotate: isHovered ? [0, 90, 180] : 0,
            }}
            transition={{
              duration: 1.5,
              repeat: isHovered ? Infinity : 0,
            }}
            className="absolute -right-1 -top-1"
          >
            <SparklesIcon className="h-4 w-4 text-amber-400" />
          </motion.div>

          {/* Animated underline that has a wave pattern
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400"
            style={{
              width: "100%",
              transformOrigin: "center",
              margin: "0 auto",
            }}
            initial={{ scaleX: 0 }}
            animate={{
              scaleX: isHovered ? 1 : 0,
              y: isHovered ? [0, 2, 0, -2, 0] : 0,
            }}
            transition={{
              scaleX: { duration: 0.3 },
              y: {
                duration: 1.5,
                repeat: isHovered ? Infinity : 0,
                repeatType: "loop",
              },
            }}
          /> */}
        </motion.span>
      </Button>
    </motion.div>
  );
};
