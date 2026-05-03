import { formatCurrency } from "@/utils/helpers/formatHelpers";
import { motion } from "motion/react";
import { COLORS } from "../utils/constants";
import { AllocationFilters, AllocationItem } from "../utils/types";

interface AllocationListProps {
  data: AllocationItem[];
  viewMode: AllocationFilters["viewMode"];
}

export const AllocationList = ({ data, viewMode }: AllocationListProps) => {
  const manyItems = data.length > 20;
  const labelTextClass = viewMode === "sectors" ? "text-xs sm:text-sm md:text-base" : "text-sm md:text-base";
  const formatLabel = (item: AllocationItem) => {
    const label = (viewMode === "sectors" ? item.sectorName : item.name) ?? "";
    if (viewMode !== "sectors") return label;
    if (label.length <= 15) return label;
    return `${label.slice(0, 14)}…`;
  };
  return (
    <div className={manyItems ? "grid grid-cols-2 lg:grid-cols-3 gap-2" : "grid grid-cols-2 gap-2"}>
      {data.map((item, index) => (
        <motion.div
          key={viewMode === "sectors" ? item.sectorName : item.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: index * 0.1,
            type: "spring",
            stiffness: 300,
            damping: 30,
          }}
          className="relative bg-slate-800 rounded-lg p-1 border border-slate-700"
        >
          <div className="flex justify-between mb-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
              <span
                className={`${labelTextClass} font-medium text-gray-100`}
                title={(viewMode === "sectors" ? item.sectorName : item.name) ?? ""}
              >
                {formatLabel(item)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-gray-100 font-medium">
                {typeof item.percentage === "number" ? `${item.percentage.toFixed(1)}%` : "0.0%"}
              </span>
              <div className="text-sm text-gray-200">{formatCurrency(item.totalAmount)}</div>
            </div>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
              initial={{ width: 0 }}
              animate={{ width: `${item.percentage}%` }}
              transition={{
                duration: 0.6,
                type: "tween",
                ease: "easeInOut",
              }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
};
