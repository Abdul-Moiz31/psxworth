"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { motion } from "motion/react";
import React from "react";

type Props = {
  message?: string;
  hasActiveFilters?: boolean;
  onShowAll?: () => void;
};

export const UpcomingPayoutsEmpty: React.FC<Props> = ({ message, hasActiveFilters = false, onShowAll }) => {
  const defaultMessage = hasActiveFilters
    ? "No payouts match your current filters."
    : "No upcoming payouts found in the next 90 days.";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg p-6 text-center shadow-sm"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Calendar className="h-6 w-6 text-muted-foreground" />
        </div>

        <div className="space-y-2">
          <h3 className="text-base font-medium text-foreground">{message || defaultMessage}</h3>
        </div>

        {hasActiveFilters && onShowAll && (
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={onShowAll}
              className="bg-slate-700 border-slate-600 hover:bg-slate-600"
            >
              View All Upcoming Payouts
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default UpcomingPayoutsEmpty;
