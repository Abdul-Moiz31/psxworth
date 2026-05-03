"use client";

import { UpcomingPayoutRecord } from "@/actions/payouts";
import { formatCurrency, formatDate, formatPercentage } from "@/utils/helpers/formatHelpers";
import { motion } from "motion/react";
import React from "react";

type Props = {
  payout: UpcomingPayoutRecord;
  userShares: number;
};

function getRelativeDate(date: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`;
  if (diffDays < -1 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;
  return formatDate(date);
}

function getComputedValues(payout: UpcomingPayoutRecord, userShares: number) {
  const percent = payout.percentValue ?? 0;
  const face = payout.faceValue ?? 0;
  const perShare = (percent / 100) * face;

  if (payout.actionType === "dividend") {
    const expectedCash = perShare * userShares;
    return {
      type: "dividend" as const,
      expectedPrimaryLabel: "Expected Cash",
      expectedPrimaryValue: formatCurrency(expectedCash),
      perShare,
      percent,
      face,
    };
  }

  // Treat bonus and split similarly for expected extra shares per spec
  if (payout.actionType === "bonus" || payout.actionType === "split") {
    const expectedExtraShares = (percent / 100) * userShares;
    return {
      type: payout.actionType as "bonus" | "split",
      expectedPrimaryLabel: "Expected Shares",
      expectedPrimaryValue: `${formatCurrency(expectedExtraShares)} shares`,
      perShare,
      percent,
      face,
    };
  }

  if (payout.actionType === "right") {
    const entitlementShares = (percent / 100) * userShares;
    return {
      type: "right" as const,
      expectedPrimaryLabel: "Entitlement",
      expectedPrimaryValue: `${formatCurrency(entitlementShares)} shares`,
      perShare,
      percent,
      face,
    };
  }

  return {
    type: "unknown" as const,
    expectedPrimaryLabel: "Expected",
    expectedPrimaryValue: "—",
    perShare,
    percent,
    face,
  };
}

function getActionTypeLabel(actionType: string): string {
  return actionType.charAt(0).toUpperCase() + actionType.slice(1);
}

export const UpcomingPayoutItem: React.FC<Props> = ({ payout, userShares }) => {
  const { expectedPrimaryValue, percent, face, type } = getComputedValues(payout, userShares);
  const companyName = payout.name ?? payout.symbol;
  const actionTypeLabel = getActionTypeLabel(payout.actionType);
  const relativeDate = getRelativeDate(payout.exDate);
  const perShare = percent && face ? (percent / 100) * face : 0;

  // Format highlight value with PKR prefix for currency values
  const highlightValue =
    type === "dividend" && !expectedPrimaryValue.includes("PKR") && !expectedPrimaryValue.includes("$")
      ? `PKR ${expectedPrimaryValue}`
      : expectedPrimaryValue;

  // Calculate net dividend after 15% tax deduction
  const netDividend = type === "dividend" ? perShare * userShares * 0.85 : null;

  return (
    <motion.div
      layout="position"
      layoutId={payout.naturalKey}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="w-full rounded-md overflow-hidden shadow-lg border border-slate-700"
    >
      {/* Header */}
      <div className="bg-slate-800/90 border-b border-slate-700 px-4 py-[18px]">
        <h3 className="m-0 text-[1.2em] font-semibold text-slate-200/90">{`${payout.symbol} ${actionTypeLabel}`}</h3>
        <div className="text-slate-300/90 text-[0.9em] mt-1">{`${companyName} • ${relativeDate}`}</div>
      </div>

      {/* Content */}
      <div className="bg-slate-900 px-4 py-5 grid grid-cols-2 gap-x-4 gap-y-1">
        {/* Highlight Amount - Only show when user has shares */}
        {userShares > 0 && (
          <div className="col-span-2 mb-1.5">
            <span className="text-xs text-slate-400 font-medium mr-2">Expected</span>
            <span className="text-[1.5em] text-green-400 font-bold">{highlightValue}</span>
          </div>
        )}

        {/* Net Dividend (after 15% tax) - Only for dividends and when user has shares */}
        {netDividend !== null && userShares > 0 && (
          <div className="col-span-2 mb-1.5">
            <span className="text-xs text-slate-400 font-medium mr-2">Net (after 15% tax)</span>
            <span className="text-[1.2em] text-green-500 font-semibold">PKR {formatCurrency(netDividend)}</span>
          </div>
        )}

        {/* Ex-Date */}
        <div className="text-slate-400 text-[0.85em] font-medium">Ex-Date</div>
        <div className="font-semibold text-slate-100">{formatDate(payout.exDate)}</div>

        {/* Face Value */}
        <div className="text-slate-400 text-[0.85em] font-medium">Face Value</div>
        <div className="font-semibold text-slate-100">{face ? formatCurrency(face) : "—"}</div>

        {/* Payout % */}
        <div className="text-slate-400 text-[0.85em] font-medium">Payout %</div>
        <div className="font-semibold text-slate-100">{percent ? formatPercentage(percent) : "—"}</div>

        {/* Cash / Share */}
        <div className="text-slate-400 text-[0.85em] font-medium">
          {payout.actionType === "dividend"
            ? "Cash / Share"
            : payout.actionType === "bonus"
              ? "Bonus / Share"
              : payout.actionType === "split"
                ? "Split Ratio"
                : payout.actionType === "right"
                  ? "Rights / Share"
                  : "Per Share"}
        </div>
        <div className="font-semibold text-slate-100">{perShare ? formatCurrency(perShare) : "—"}</div>
      </div>
    </motion.div>
  );
};

export default UpcomingPayoutItem;
