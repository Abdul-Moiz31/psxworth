"use client";

import { fetchStatsSummary } from "@/actions/status/stats";
import { useQuery } from "@tanstack/react-query";
import * as motion from "motion/react-client";

const numberFormatter = Intl.NumberFormat(undefined, {
  notation: "compact",
  maximumFractionDigits: 1,
});

const dashboardLabels = [
  { label: "Total Users", caption: "Investors onboard" },
  { label: "Transactions", caption: "Records tracked" },
];

export const DashboardStats = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: fetchStatsSummary,
    staleTime: 30000, //
  });

  const dashboardData = stats
    ? [
        {
          label: "Total Users",
          value: numberFormatter.format(stats.totalUsers),
          caption: "Investors onboard",
        },
        {
          label: "Transactions",
          value: numberFormatter.format(stats.totalTransactions),
          caption: "Records tracked",
        },
      ]
    : dashboardLabels;

  return (
    <motion.div
      className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7, duration: 0.5 }}
    >
      {dashboardData.map((item, i) => (
        <motion.div
          key={item.label}
          className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur transition-all"
          whileHover={{ y: -4, scale: 1.02 }}
        >
          <div className="text-xs font-medium uppercase tracking-[0.2em] text-slate-300/70">{item.label}</div>
          <motion.div
            className="mt-2 flex min-h-8 items-center justify-center text-2xl font-semibold text-gray-100"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 + i * 0.2 }}
          >
            {isLoading ? (
              <svg
                className="h-6 w-6 animate-spin text-blue-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : "value" in item ? (
              item.value
            ) : (
              " - "
            )}
          </motion.div>
          {item.caption ? (
            <motion.div
              className="mt-1 text-xs text-slate-300/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 + i * 0.2 }}
            >
              {item.caption}
            </motion.div>
          ) : null}
        </motion.div>
      ))}
    </motion.div>
  );
};
