"use client";

import { Portfolio } from "@/db/schema";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import PortfolioCard from "../../../../PortfolioCard";

interface PortfolioItemProps {
  portfolio: Portfolio;
}

const PortfolioItem = ({ portfolio }: PortfolioItemProps) => {
  const params = useParams();
  const isActive = Number(params.portfolioId) === portfolio.id;

  return (
    <motion.div
      key={portfolio.id}
      initial={{ opacity: 0, y: -10, height: 0, scale: 0.95 }}
      animate={{
        opacity: 1,
        y: 0,
        height: "auto",
        scale: 1,
      }}
      transition={{
        duration: 0.2,
        type: "spring",
        stiffness: 500,
        damping: 25,
      }}
    >
      <motion.div
        className={cn(
          "transform overflow-hidden rounded-lg border border-sidebar-border/60",
          isActive
            ? "border-primary/60 bg-sidebar-accent/70 ring-1 ring-primary/35"
            : "bg-sidebar-accent/25 hover:border-primary/45 hover:bg-sidebar-accent/45"
        )}
        animate={{
          backgroundColor: isActive ? "hsl(var(--sidebar-accent) / 0.75)" : "hsl(var(--sidebar-accent) / 0.25)",
        }}
        whileHover={{
          backgroundColor: isActive ? "hsl(var(--sidebar-accent) / 0.8)" : "hsl(var(--sidebar-accent) / 0.45)",
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
      >
        <div className="relative">
          <Link href={`/portfolio/${portfolio.id}`} className="block w-full text-gray-100" prefetch={false}>
            <PortfolioCard portfolio={portfolio} />
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PortfolioItem;
