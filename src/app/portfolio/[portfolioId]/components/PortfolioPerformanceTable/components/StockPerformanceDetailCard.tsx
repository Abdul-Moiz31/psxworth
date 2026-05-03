import { StockDetailedPerformance } from "@/interfaces";

interface StockPerformanceDetailCardProps {
  stockPerformance: StockDetailedPerformance;
}

export const StockPerformanceDetailCard = (props: StockPerformanceDetailCardProps) => {
  const { stockPerformance: data } = props;
  return (
    <div className="bg-slate-800 rounded-lg shadow-lg p-3 border border-slate-700 ">
      <div className="flex flex-col gap-4">
        {/* Header with stock symbol and basic info */}
        <div className="flex justify-between items-center border-b border-slate-700 pb-3">
          <h3 className="text-lg font-semibold text-gray-100">{data.stockSymbol}</h3>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="text-sm text-slate-400">Purchase Info</div>
            <div className="flex justify-between">
              <span>Total Shares:</span>
              <span className="font-medium">{data.totalShares.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Average Cost:</span>
              <span className="font-medium">
                {data.averageCost.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Commission and Taxes:</span>
              <span className="font-medium">
                {data.commissionAndTaxes.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Total Cost:</span>
              <span className="font-medium">
                {(data.totalShares * data.averageCost).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-slate-400">Current Value</div>
            <div className="flex justify-between">
              <span>Current Price:</span>
              <span className="font-medium">
                {data.currentPrice.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Total Value:</span>
              <span className="font-medium">
                {data.currentValue.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-slate-400">Performance</div>
            <div className="flex justify-between">
              <span>Unrealized Profit:</span>
              <span className={`font-medium ${data.unrealizedProfit >= 0 ? "text-green-400" : "text-red-500"}`}>
                {data.unrealizedProfit.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
                (
                {data.unrealizedProfitPercentage.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
                %)
              </span>
            </div>

            <div className="flex justify-between">
              <span>Realized Profit:</span>
              <span className="font-medium">
                {data.realizedProfit.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Dividends Paid:</span>
              <span className="font-medium">
                {data.totalDividends.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Total Profit:</span>
              <span className={`font-medium ${data.totalProfit >= 0 ? "text-green-400" : "text-red-500"}`}>
                {data.totalProfit.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
                {/* (
                {data.totalProfitPercentage.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
                %) */}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Today&apos;s P/L:</span>
              <span className={`font-medium ${(data.todayPnL ?? 0) >= 0 ? "text-green-400" : "text-red-500"}`}>
                {data.todayPnL == null || data.todayPnLPercentage == null
                  ? "—"
                  : `${data.todayPnL.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })} (${data.todayPnLPercentage.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}%)`}
              </span>
            </div>
          </div>
        </div>

        {/* Additional info */}
        <div className="mt-2 pt-3 border-t border-slate-700">
          <div className="flex justify-between">
            <span>With Dividends:</span>
            <span className={`font-medium ${data.totalProfitWithDividends >= 0 ? "text-green-400" : "text-red-500"}`}>
              {data.totalProfitWithDividends.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
              {/* (
               {data.totalProfitWithDividendsPercentage.toLocaleString(
                undefined,
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }
              )} */}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
