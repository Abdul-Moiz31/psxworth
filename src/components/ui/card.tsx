import { motion } from "motion/react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "gradient" | "outlined";
  animate?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = "", variant = "default", animate = false }) => {
  const baseStyles = "rounded-2xl p-4 md:p-6 backdrop-blur-sm";

  const variantStyles = {
    default: "bg-white/5 border border-white/10",
    gradient: "bg-gradient-to-r from-blue-600/20 to-purple-800/20 border border-white/10",
    outlined: "border border-blue-400/50 bg-transparent",
  };

  const content = <div className={`${baseStyles} ${variantStyles[variant]} ${className}`}>{children}</div>;

  if (animate) {
    return (
      <motion.div whileHover={{ y: -5, boxShadow: "0 15px 30px rgba(0,0,0,0.1)" }} transition={{ duration: 0.3 }}>
        {content}
      </motion.div>
    );
  }

  return content;
};
