"use client";

import { UpcomingPayoutRecord } from "@/actions/payouts";
import UpcomingPayoutItem from "@/components/molecules/payouts/UpcomingPayoutItem";
import UpcomingPayoutsEmpty from "@/components/molecules/payouts/upcoming/UpcomingPayoutsEmpty";
import UpcomingPayoutsError from "@/components/molecules/payouts/upcoming/UpcomingPayoutsError";
import UpcomingPayoutsFilters from "@/components/molecules/payouts/upcoming/UpcomingPayoutsFilters";
import { useAllPayouts } from "@/utils/hooks/payouts/useAllPayouts";
import { Loader2 } from "lucide-react";
import React from "react";

type Props = {
  symbols: string[];
  symbolToShares: Record<string, number>;
};

export const UpcomingPayouts: React.FC<Props> = ({ symbols, symbolToShares }) => {
  const today = React.useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const dateAfter90Days = React.useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + 90);
    return d;
  }, [today]);

  const [showAll, setShowAll] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<"all" | "dividend" | "bonus" | "split" | "right">("all");

  const {
    data: allPayoutsData,
    isPending,
    isError,
    refetch,
  } = useAllPayouts({
    from: today,
    to: dateAfter90Days,
  });

  const filteredAndSorted = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = allPayoutsData ?? [];

    // Filter by portfolio symbols if not showing all
    if (!showAll) {
      list = list.filter((p) => symbols.includes(p.symbol));
    }

    if (typeFilter !== "all") {
      list = list.filter((p) => p.actionType === typeFilter);
    }

    if (q) {
      list = list.filter((p) => p.symbol.toLowerCase().includes(q));
    }

    // Sort by ex-date: nearest upcoming first (earliest to latest)
    return list.slice().sort((a, b) => new Date(a.exDate).getTime() - new Date(b.exDate).getTime());
  }, [allPayoutsData, query, typeFilter, showAll, symbols]);

  if (isError) return <UpcomingPayoutsError onRetry={() => refetch()} />;

  return (
    <div className="flex flex-col rounded-lg border border-sidebar-border/70 bg-slate-900 text-slate-100">
      <div className="shrink-0 border-b border-sidebar-border/70 bg-slate-800 p-2 sticky -top-3 z-20">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {!isPending && (
            <div className="inline-flex items-center shrink-0 rounded-md bg-slate-900/70 px-2 py-1 text-[0.7rem] sm:text-xs uppercase tracking-[0.2em] text-slate-300 h-8">
              {filteredAndSorted.length} payout{filteredAndSorted.length !== 1 ? "s" : ""}
            </div>
          )}
          <div className="flex-1 md:ml-4">
            <UpcomingPayoutsFilters
              query={query}
              onQueryChange={setQuery}
              typeFilter={typeFilter}
              onTypeFilterChange={setTypeFilter}
              showAll={showAll}
              onShowAllChange={setShowAll}
            />
          </div>
        </div>
      </div>

      <div className="overflow-y-auto p-2">
        {isPending && (
          <div className="flex min-h-52 flex-col items-center justify-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-sm text-gray-400">Loading payouts...</span>
          </div>
        )}
        {!isPending && filteredAndSorted.length === 0 ? (
          <UpcomingPayoutsEmpty
            hasActiveFilters={query.trim() !== "" || typeFilter !== "all" || !showAll}
            onShowAll={!showAll ? () => setShowAll(true) : undefined}
          />
        ) : (
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3 5xl:grid-cols-4">
            {filteredAndSorted.map((p: UpcomingPayoutRecord) => (
              <UpcomingPayoutItem key={p.naturalKey} payout={p} userShares={symbolToShares[p.symbol] ?? 0} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingPayouts;
