import { getAllUpcomingPayouts, UpcomingPayoutRecord } from "@/actions/payouts";
import { handleServerPromise } from "@/utils/helpers/server";
import { useQuery } from "@tanstack/react-query";

export type UseAllPayoutsParams = {
  from?: Date;
  to?: Date;
  limit?: number;
  enabled?: boolean;
};

export const useAllPayouts = ({ from, to, limit, enabled = true }: UseAllPayoutsParams) => {
  return useQuery<UpcomingPayoutRecord[]>({
    queryKey: ["all-payouts", from ? from.getTime() : null, to ? to.getTime() : null, limit ?? null],
    queryFn: () => handleServerPromise(getAllUpcomingPayouts({ from, to, limit })) as Promise<UpcomingPayoutRecord[]>,
    enabled: enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
};
