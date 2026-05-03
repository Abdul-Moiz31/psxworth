import { getEtfDetailsMultiple } from "@/actions/etf/etfActions";
import { handleServerPromise } from "@/utils/helpers/server";
import { useQuery } from "@tanstack/react-query";

export const useEtfDetails = (etfSymbols: string[], enabled: boolean = true) => {
  return useQuery({
    queryKey: ["etfDetails", etfSymbols.sort()],
    queryFn: async () => {
      const response = await handleServerPromise(getEtfDetailsMultiple(etfSymbols));
      return response.data;
    },
    enabled,
  });
};
