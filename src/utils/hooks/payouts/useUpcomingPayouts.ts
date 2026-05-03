import { getUpcomingPayoutsForSymbols, UpcomingPayoutRecord } from "@/actions/payouts";
import { handleServerPromise } from "@/utils/helpers/server";
import { useQuery } from "@tanstack/react-query";

export type UseUpcomingPayoutsParams = {
  symbols: string[];
  from?: Date;
  to?: Date;
  limit?: number;
  enabled?: boolean;
};

export const useUpcomingPayouts = ({ symbols, from, to, limit, enabled = true }: UseUpcomingPayoutsParams) => {
  return useQuery<UpcomingPayoutRecord[]>({
    queryKey: [
      "payouts",
      (symbols || []).slice().sort().join(","),
      from ? from.getTime() : null,
      to ? to.getTime() : null,
      limit ?? null,
    ],
    queryFn: () =>
      handleServerPromise(getUpcomingPayoutsForSymbols({ symbols, from, to, limit })) as Promise<
        UpcomingPayoutRecord[]
      >,
    enabled: enabled && Array.isArray(symbols) && symbols.length > 0,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
};
