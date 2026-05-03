import { ArrowUp } from "lucide-react";
import * as motion from "motion/react-client";
import ChartAnimation from "./ChartAnimation";
import { DashboardStats } from "./DashboardStats";

export const StockDashboard = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
      className="relative h-[400px] w-full overflow-hidden rounded-2xl p-1 sm:p-4"
    >
      <motion.div
        className="h-full w-full transform rounded-xl border border-white/20 bg-white/5 p-6 backdrop-blur-md"
        whileHover={{ scale: 1.01 }}
        style={{ transformOrigin: "center center" }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <div className="relative z-10 flex h-full w-full flex-col" aria-hidden="true">
          {/* Fixed height container with stable dimensions */}
          <div className="h-[100px] rounded-lg bg-black/10 p-3">
            <div className="mb-1 flex h-5 items-center overflow-hidden text-sm font-medium text-gray-300">
              <span className="translate-z-0 transform whitespace-nowrap">Portfolio Value</span>
            </div>

            <motion.div
              className="relative flex h-10 items-center gap-2 text-2xl font-bold"
              transition={{ duration: 0.2 }}
              style={{ willChange: "transform" }}
            >
              <motion.span
                className="h-6 w-1 flex-shrink-0 rounded bg-blue-500/50"
                initial={{ height: 0 }}
                animate={{ height: "24px" }}
                transition={{ duration: 0.4, delay: 0.2 }}
              />

              <div className="flex min-w-0 flex-col overflow-hidden">
                <motion.span
                  className="flex w-full items-center"
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <span className="whitespace-nowrap">PKR 2,456,789</span>
                  <motion.div
                    className="ml-2 flex flex-shrink-0 items-center text-sm font-medium text-green-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    12.4%
                  </motion.div>
                  <ArrowUp color="oklch(79.2% 0.209 151.711)" strokeWidth={1.5} />
                </motion.span>

                <motion.span
                  className="h-5 whitespace-nowrap text-xs text-gray-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  Updated 5 minutes ago
                </motion.span>
              </div>
            </motion.div>
          </div>
          <ChartAnimation />
          <DashboardStats />
        </div>
      </motion.div>
    </motion.div>
  );
};
