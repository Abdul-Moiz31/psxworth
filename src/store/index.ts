import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export type HoldingsFilterMode = "all" | "current" | "liquidated";

interface PortfolioSettings {
  holdingsFilter: HoldingsFilterMode;
}

interface PortfolioState {
  portfolioSettings: Record<number, PortfolioSettings>;

  setHoldingsFilter: (portfolioId: number, value: HoldingsFilterMode) => void;
  getHoldingsFilter: (portfolioId: number) => HoldingsFilterMode;
}

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    immer((set, get) => ({
      portfolioSettings: {},

      setHoldingsFilter: (portfolioId: number, value: HoldingsFilterMode) =>
        set((state) => {
          if (!state.portfolioSettings[portfolioId]) {
            state.portfolioSettings[portfolioId] = { holdingsFilter: "all" };
          }
          state.portfolioSettings[portfolioId].holdingsFilter = value;
        }),

      getHoldingsFilter: (portfolioId: number) => {
        return get().portfolioSettings[portfolioId]?.holdingsFilter ?? "all";
      },
    })),
    {
      name: "portfolio-store-v2",
      onRehydrateStorage: () => {
        if (typeof window !== "undefined") {
          window.localStorage.removeItem("portfolio-store");
        }
      },
    }
  )
);

// Convenience hook
export const useHoldingsFilter = (portfolioId: number) =>
  usePortfolioStore((state) => state.getHoldingsFilter(portfolioId));
