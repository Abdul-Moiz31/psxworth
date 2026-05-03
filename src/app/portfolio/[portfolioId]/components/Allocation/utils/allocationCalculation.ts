import { StockDetailedPerformance } from "@/interfaces";
import { StockInfo } from "@/types";
import { AggregatedEtfCash, AllocationFilters, EtfDetailsWithPrice, SectorAllocation } from "./types";

export function calculateSectorAllocation(
  stocks: StockDetailedPerformance[],
  stocksInfo: StockInfo[],
  filters: AllocationFilters
) {
  const sectorMap = new Map<string, SectorAllocation>();

  stocks.forEach((stock) => {
    const stockInfo = stocksInfo.find((info) => info.symbol === stock.stockSymbol);
    if (!stockInfo) return;

    const amount = filters.view === "value" ? stock.currentValue : stock.totalCost;
    const sectorName = stockInfo.sectorName;

    if (!sectorMap.has(sectorName)) {
      sectorMap.set(sectorName, {
        sectorName,
        totalAmount: 0,
        percentage: 0,
        stocks: [],
      });
    }

    const sector = sectorMap.get(sectorName)!;
    sector.totalAmount += amount;
    sector.stocks.push(stock);
  });

  const totalAmount = Array.from(sectorMap.values()).reduce((sum, sector) => sum + sector.totalAmount, 0);

  const data = Array.from(sectorMap.values())
    .map((sector) => ({
      ...sector,
      percentage: totalAmount > 0 ? (sector.totalAmount / totalAmount) * 100 : 0,
    }))
    .sort((a, b) => b.percentage - a.percentage);

  return { data, totalAmount };
}

export function calculateStockAllocation(stocks: StockDetailedPerformance[], filters: AllocationFilters) {
  const totalAmount = stocks.reduce((sum, stock) => {
    const amount = filters.view === "value" ? stock.currentValue : stock.totalCost;
    return sum + amount;
  }, 0);

  const data = stocks
    .map((stock) => {
      const amount = filters.view === "value" ? stock.currentValue : stock.totalCost;
      return {
        name: stock.stockSymbol,
        totalAmount: amount,
        percentage: totalAmount > 0 ? (amount / totalAmount) * 100 : 0,
      };
    })
    .sort((a, b) => b.percentage - a.percentage);

  return { data, totalAmount };
}

function calculateAggregatedEtfCash(
  etfDetails: EtfDetailsWithPrice[],
  etfPositionMap: Map<string, StockDetailedPerformance>
): AggregatedEtfCash | null {
  let totalValue = 0;
  let totalCost = 0;
  let meta: {
    portfolioId?: number;
    userId?: string;
    createdAt?: Date;
    updatedAt?: Date;
  } | null = null;

  etfDetails.forEach((etf) => {
    const position = etfPositionMap.get(etf.symbol);
    if (!position) return;

    const units = position.totalShares ?? 0;
    if (!units) return;

    const cashValue =
      etf.cashComponent != null
        ? (etf.cashComponent * units) / 10000
        : etf.cashComponentPercent != null && position.currentValue
          ? (etf.cashComponentPercent / 100) * position.currentValue
          : 0;

    if (!cashValue) return;

    const etfMarketValue = position.currentValue ?? 0;
    const etfTotalCost = position.totalCost ?? 0;
    const cashCost = etfMarketValue ? etfTotalCost * (cashValue / etfMarketValue) : 0;

    totalValue += cashValue;
    totalCost += cashCost;

    if (!meta) {
      meta = {
        portfolioId: position.portfolioId ?? etf.portfolioId,
        userId: position.userId ?? etf.userId,
        createdAt: position.createdAt,
        updatedAt: position.updatedAt,
      };
    }
  });

  if (!totalValue) return null;

  return { totalValue, totalCost, meta };
}

export function mergeEtfHoldingsIntoStocks(
  stocks: StockDetailedPerformance[],
  etfDetails: EtfDetailsWithPrice[],
  etfSymbols: string[]
): StockDetailedPerformance[] {
  if (!etfDetails?.length) return stocks;

  const etfSymbolSet = new Set(etfSymbols);
  const baseStocks = stocks.filter((stock) => !etfSymbolSet.has(stock.stockSymbol));
  const etfPositionMap = new Map(
    stocks.filter((stock) => etfSymbolSet.has(stock.stockSymbol)).map((stock) => [stock.stockSymbol, stock])
  );

  const stockMap = new Map<string, StockDetailedPerformance>();
  baseStocks.forEach((stock) => {
    stockMap.set(stock.stockSymbol, stock);
  });

  etfDetails.forEach((etf) => {
    const etfPosition = etfPositionMap.get(etf.symbol);

    if (!etfPosition) return;

    const etfUnits = etfPosition.totalShares ?? 0;
    const etfTotalCost = etfPosition.totalCost;
    const etfMarketValue = etfPosition.currentValue;
    if (!etfUnits) return;

    etf.holdings.forEach((holding) => {
      if (holding.price == null) return;

      const exposureShares = (etfUnits * holding.shares) / 10000;
      const exposureValue = exposureShares * holding.price;
      const exposureCost = etfTotalCost * (exposureValue / etfMarketValue);

      const existing = stockMap.get(holding.holdingSymbol);

      if (existing) {
        stockMap.set(holding.holdingSymbol, {
          ...existing,
          totalShares: existing.totalShares + exposureShares,
          currentValue: existing.currentValue + exposureValue,
          totalCost: existing.totalCost + exposureCost,
          currentPrice: holding.price,
          unrealizedProfit: existing.unrealizedProfit + (exposureValue - exposureCost),
        });
      } else {
        stockMap.set(holding.holdingSymbol, {
          id: etfPosition.id ?? -1,
          stockSymbol: holding.holdingSymbol,
          averageCost: exposureCost / exposureShares,
          totalShares: exposureShares,
          totalCost: exposureCost,
          totalDividends: 0,
          realizedProfit: 0,
          commissionAndTaxes: 0,
          totalInflow: 0,
          totalOutflow: 0,
          createdAt: etfPosition.createdAt ?? new Date(0),
          updatedAt: etfPosition.updatedAt ?? new Date(0),
          portfolioId: etf.portfolioId ?? etfPosition.portfolioId ?? 0,
          userId: etf.userId ?? etfPosition.userId ?? "",
          currentValue: exposureValue,
          unrealizedProfit: exposureValue - exposureCost,
          unrealizedProfitPercentage: 0,
          sinceAverageBuyPrice: 0,
          sinceAverageBuyPricePercentage: 0,
          totalProfit: 0,
          totalProfitPercentage: 0,
          totalProfitWithDividends: 0,
          totalProfitWithDividendsPercentage: 0,
          previousCloseValue: null,
          todayPnL: null,
          todayPnLPercentage: null,
          currentPrice: holding.price,
        });
      }
    });
  });

  const aggregatedCash = calculateAggregatedEtfCash(etfDetails, etfPositionMap);
  if (aggregatedCash) {
    const cashSymbol = "ETF-CASH";
    const existingCash = stockMap.get(cashSymbol);
    if (existingCash) {
      const totalShares = existingCash.totalShares + aggregatedCash.totalValue;
      const totalCost = existingCash.totalCost + aggregatedCash.totalCost;
      const currentValue = existingCash.currentValue + aggregatedCash.totalValue;
      const unrealizedProfit = currentValue - totalCost;

      stockMap.set(cashSymbol, {
        ...existingCash,
        totalShares,
        totalCost,
        currentValue,
        averageCost: totalShares > 0 ? totalCost / totalShares : existingCash.averageCost,
        unrealizedProfit,
        currentPrice: 1,
      });
    } else {
      stockMap.set(cashSymbol, {
        id: -1,
        stockSymbol: cashSymbol,
        averageCost: aggregatedCash.totalValue ? aggregatedCash.totalCost / aggregatedCash.totalValue : 0,
        totalShares: aggregatedCash.totalValue,
        totalCost: aggregatedCash.totalCost,
        totalDividends: 0,
        realizedProfit: 0,
        commissionAndTaxes: 0,
        totalInflow: 0,
        totalOutflow: 0,
        createdAt: aggregatedCash.meta?.createdAt ?? new Date(0),
        updatedAt: aggregatedCash.meta?.updatedAt ?? new Date(0),
        portfolioId: aggregatedCash.meta?.portfolioId ?? 0,
        userId: aggregatedCash.meta?.userId ?? "",
        currentValue: aggregatedCash.totalValue,
        unrealizedProfit: aggregatedCash.totalValue - aggregatedCash.totalCost,
        unrealizedProfitPercentage: 0,
        sinceAverageBuyPrice: 0,
        sinceAverageBuyPricePercentage: 0,
        totalProfit: 0,
        totalProfitPercentage: 0,
        totalProfitWithDividends: 0,
        totalProfitWithDividendsPercentage: 0,
        previousCloseValue: null,
        todayPnL: null,
        todayPnLPercentage: null,
        currentPrice: 1,
      });
    }
  }

  return Array.from(stockMap.values());
}
