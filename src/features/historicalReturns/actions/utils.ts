import { toDateOnlyDate, toDateOnlyTimestamp } from "@/features/historicalReturns/shared/dateUtils";
import { CashFlow, PortfolioValuePoint, ReturnPoint } from "@/features/historicalReturns/shared/types";
import { coerceToDatePreservingLocalDate } from "@/types/localDate";

/**
 * Ensures a value is a Date object. Handles serialized dates from server actions.
 */
function ensureDate(date: Date | string | number): Date {
  return coerceToDatePreservingLocalDate(date);
}

/**
 * Generates date points for a time series between start and end dates.
 * For short periods (< 7 days), uses daily granularity.
 * For longer periods, uses weekly or monthly aggregation.
 */
export function generateDatePoints(startDate: Date, endDate: Date): Date[] {
  const normalizedStartDate = toDateOnlyDate(startDate);
  const normalizedEndDate = toDateOnlyDate(endDate);
  const daysDiff = Math.ceil((normalizedEndDate.getTime() - normalizedStartDate.getTime()) / (1000 * 60 * 60 * 24));

  const datePoints: Date[] = [];
  const currentDate = new Date(normalizedStartDate);

  if (daysDiff <= 90) {
    //Daily granularity for short periods
    while (currentDate.getTime() <= normalizedEndDate.getTime()) {
      datePoints.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
  } else {
    // 3 days granularity for long periods
    while (currentDate.getTime() <= normalizedEndDate.getTime()) {
      datePoints.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 3);
    }
  }

  if (datePoints[datePoints.length - 1]?.getTime() !== normalizedEndDate.getTime()) {
    datePoints.push(new Date(normalizedEndDate));
  }

  return datePoints;
}

/**
 * Helper function to get preset date ranges.
 */
export function getPresetDateRange(preset: "7d" | "30d" | "6m"): { startDate: Date; endDate: Date } {
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999); // End of today

  const startDate = new Date();

  switch (preset) {
    case "7d":
      startDate.setDate(startDate.getDate() - 7);
      break;
    case "30d":
      startDate.setDate(startDate.getDate() - 30);
      break;
    case "6m":
      startDate.setMonth(startDate.getMonth() - 6);
      break;
  }

  startDate.setHours(0, 0, 0, 0); // Start of day

  return { startDate, endDate };
}

/**
 * Calculates Time-Weighted Return (TWR) for a portfolio.
 * TWR measures portfolio performance independent of cash flows.
 *
 * Algorithm:
 * 1. Identify cash flow dates (buy/sell transactions)
 * 2. Calculate return for each period between cash flows: (V_end - V_start) / V_start
 * 3. Compound returns: (1 + r1) × (1 + r2) × ... × (1 + rn) - 1
 * 4. Return cumulative TWR for each date
 */
export function calculateTimeWeightedReturn(portfolioValues: PortfolioValuePoint[]): ReturnPoint[] {
  if (portfolioValues.length === 0) {
    return [];
  }

  // Normalize dates to Date objects (handle serialized dates from server)
  const normalizedValues = portfolioValues.map((point) => ({
    ...point,
    date: ensureDate(point.date),
    cashFlows: point.cashFlows.map((cf) => ({
      ...cf,
      date: ensureDate(cf.date),
    })),
  }));
  const sortedValues = [...normalizedValues].sort((a, b) => toDateOnlyTimestamp(a.date) - toDateOnlyTimestamp(b.date));

  const hasCashFlows = sortedValues.some((point) => point.cashFlows.length > 0);

  // If no cash flows, use simple return calculation
  if (!hasCashFlows) {
    const initialValue = sortedValues[0]?.portfolioValue || 0;
    if (initialValue === 0) {
      return sortedValues.map((point) => ({
        date: point.date,
        return: 0,
        portfolioValue: point.portfolioValue,
      }));
    }

    return sortedValues.map((point) => {
      const returnValue = ((point.portfolioValue - initialValue) / initialValue) * 100;
      return {
        date: point.date,
        return: returnValue,
        portfolioValue: point.portfolioValue,
      };
    });
  }

  // Calculate TWR with cash flow handling
  const twrPoints: ReturnPoint[] = [];
  let cumulativeReturn = 1; // Start with 1 (100%)
  let periodStartValue: number | null = null;
  let periodStartDate: Date | null = null;
  let lastPeriodEndValue: number | null = null;

  for (let i = 0; i < sortedValues.length; i++) {
    const currentPoint = sortedValues[i];
    const currentDate = currentPoint.date;
    const isCashFlowDate = currentPoint.cashFlows.length > 0;

    // Initialize period start
    if (periodStartValue === null) {
      periodStartValue = currentPoint.portfolioValue;
      periodStartDate = currentDate;
      lastPeriodEndValue = currentPoint.portfolioValue;
    }

    // If this is a cash flow date, end the current period and start a new one
    // Handle both first date point (i === 0) and subsequent dates (i > 0)
    if (isCashFlowDate && periodStartDate && periodStartValue !== null) {
      // Calculate return for the period ending just before the cash flow
      // Only calculate period return if this is not the first date point
      if (i > 0) {
        const periodEndValue = lastPeriodEndValue || periodStartValue;

        if (periodStartValue > 0) {
          const periodReturn = (periodEndValue - periodStartValue) / periodStartValue;
          cumulativeReturn *= 1 + periodReturn;
        }
      }

      // If transitioning from 0 to non-zero, reset cumulative return to 1
      if (periodStartValue === 0 && currentPoint.portfolioValue > 0) {
        cumulativeReturn = 1;
      }

      // Start new period after cash flow
      // The portfolio value after cash flow is the current value
      periodStartValue = currentPoint.portfolioValue;
      periodStartDate = currentDate;
      lastPeriodEndValue = currentPoint.portfolioValue;
    } else {
      // Update last period end value
      lastPeriodEndValue = currentPoint.portfolioValue;
    }

    // Handle transition from 0 to non-zero value (when not a cash flow date)
    // This can happen if value appears due to price changes without transactions
    if (periodStartValue === 0 && currentPoint.portfolioValue > 0 && !isCashFlowDate) {
      // Reset period start to current value and reset cumulative return
      periodStartValue = currentPoint.portfolioValue;
      periodStartDate = currentDate;
      cumulativeReturn = 1; // Reset cumulative return
      lastPeriodEndValue = currentPoint.portfolioValue;
    }

    // Calculate current cumulative return
    let currentReturn = 0;
    if (periodStartValue !== null && periodStartValue > 0) {
      // Calculate return from period start to current point
      const periodReturn = (currentPoint.portfolioValue - periodStartValue) / periodStartValue;
      // Apply to cumulative return
      currentReturn = (cumulativeReturn * (1 + periodReturn) - 1) * 100;
    } else if (periodStartValue === 0 && currentPoint.portfolioValue > 0) {
      // Portfolio started at 0, now has value - reset period start for next iteration
      // Don't set return to 0 here, let it be calculated in the next iteration
      currentReturn = 0;
    }

    twrPoints.push({
      date: currentDate,
      return: currentReturn,
      portfolioValue: currentPoint.portfolioValue,
    });
  }

  return twrPoints;
}

/**
 * Simplified TWR calculation for a single period (start to end).
 * Used when we only need the final return value.
 */
export function calculateTimeWeightedReturnForPeriod(portfolioValues: PortfolioValuePoint[]): number {
  if (portfolioValues.length < 2) {
    return 0;
  }

  // Normalize dates to Date objects
  const normalizedValues = portfolioValues.map((point) => ({
    ...point,
    date: ensureDate(point.date),
    cashFlows: point.cashFlows.map((cf) => ({
      ...cf,
      date: ensureDate(cf.date),
    })),
  }));

  const sortedValues = [...normalizedValues].sort((a, b) => toDateOnlyTimestamp(a.date) - toDateOnlyTimestamp(b.date));

  const initialValue = sortedValues[0]?.portfolioValue || 0;
  const finalValue = sortedValues[sortedValues.length - 1]?.portfolioValue || 0;

  if (initialValue === 0) {
    return 0;
  }

  const hasCashFlows = sortedValues.some((point) => point.cashFlows.length > 0);

  // If no cash flows, use simple return
  if (!hasCashFlows) {
    return ((finalValue - initialValue) / initialValue) * 100;
  }

  // Calculate TWR with cash flows
  let cumulativeReturn = 1;
  let periodStartValue: number | null = null;
  let periodStartDate: Date | null = null;
  let lastPeriodEndValue: number | null = null;

  for (let i = 0; i < sortedValues.length; i++) {
    const currentPoint = sortedValues[i];
    const currentDate = currentPoint.date;
    const isCashFlowDate = currentPoint.cashFlows.length > 0;

    if (periodStartValue === null) {
      periodStartValue = currentPoint.portfolioValue;
      periodStartDate = currentDate;
      lastPeriodEndValue = currentPoint.portfolioValue;
    }

    if (isCashFlowDate && periodStartDate && periodStartValue !== null && i > 0) {
      const periodEndValue = lastPeriodEndValue || periodStartValue;

      if (periodStartValue > 0) {
        const periodReturn = (periodEndValue - periodStartValue) / periodStartValue;
        cumulativeReturn *= 1 + periodReturn;
      }

      periodStartValue = currentPoint.portfolioValue;
      periodStartDate = currentDate;
      lastPeriodEndValue = currentPoint.portfolioValue;
    } else {
      lastPeriodEndValue = currentPoint.portfolioValue;
    }
  }

  // Calculate final period return
  if (periodStartValue !== null && periodStartValue > 0 && lastPeriodEndValue !== null) {
    const finalPeriodReturn = (lastPeriodEndValue - periodStartValue) / periodStartValue;
    cumulativeReturn *= 1 + finalPeriodReturn;
  }

  return (cumulativeReturn - 1) * 100;
}

/**
 * Calculates Internal Rate of Return (IRR) using Newton-Raphson method.
 * Solves for r where NPV = 0: Σ(CF_i / (1+r)^t_i) = 0
 *
 * @param cashFlows Array of cash flows with dates and amounts
 * @param startDate Reference date for time calculations
 * @param endDate Final date for time calculations
 * @returns IRR as a decimal (e.g., 0.05 for 5%)
 */
function calculateIRR(cashFlows: CashFlow[], startDate: Date, _endDate: Date): number {
  if (cashFlows.length <= 1) {
    return 0;
  }

  // If all cash flows are same sign, can't calculate meaningful IRR
  const allPositive = cashFlows.every((cf) => cf.amount >= 0);
  const allNegative = cashFlows.every((cf) => cf.amount <= 0);
  if (allPositive || allNegative) {
    return 0;
  }

  // Convert cash flows to time periods (in years from start date)
  const timePeriods = cashFlows.map((cf) => {
    const daysDiff = (toDateOnlyTimestamp(cf.date) - toDateOnlyTimestamp(startDate)) / (1000 * 60 * 60 * 24);
    return daysDiff / 365.25; // Convert to years
  });

  // Initial guess for IRR (start with 0.1 = 10%)
  let r = 0.1;
  const maxIterations = 100;
  const tolerance = 1e-6;

  for (let iteration = 0; iteration < maxIterations; iteration++) {
    // Calculate NPV and its derivative
    let npv = 0;
    let npvDerivative = 0;

    for (let i = 0; i < cashFlows.length; i++) {
      const cf = cashFlows[i];
      const t = timePeriods[i];
      const discountFactor = Math.pow(1 + r, t);

      npv += cf.amount / discountFactor;

      if (t > 0) {
        npvDerivative -= (cf.amount * t) / (discountFactor * (1 + r));
      }
    }

    // Check convergence
    if (Math.abs(npv) < tolerance) {
      break;
    }

    // Avoid division by zero
    if (Math.abs(npvDerivative) < tolerance) {
      // If derivative is too small, try a different approach
      r += npv > 0 ? 0.01 : -0.01;
      continue;
    }

    // Newton-Raphson update: r_new = r_old - NPV / NPV'
    const rNew = r - npv / npvDerivative;
    const previousR = r;

    // Bounds checking: IRR should be between -100% and reasonable upper bound
    if (rNew < -0.99) {
      r = -0.99;
    } else if (rNew > 10) {
      r = 10;
    } else {
      r = rNew;
    }

    // Check for convergence
    if (Math.abs(r - previousR) < tolerance) {
      break;
    }
  }

  return r;
}

/**
 * Calculates Money-Weighted Return (MWR) / Internal Rate of Return (IRR) for a portfolio.
 * MWR accounts for the timing and size of cash flows.
 *
 * Algorithm:
 * 1. Collect all cash flows: initial investment (negative), deposits (negative),
 *    withdrawals (positive), final value (positive)
 * 2. Solve for discount rate r where NPV = 0 using Newton-Raphson method
 * 3. Calculate cumulative MWR by solving IRR up to each date point
 */
export function calculateMoneyWeightedReturn(portfolioValues: PortfolioValuePoint[]): ReturnPoint[] {
  if (portfolioValues.length === 0) {
    return [];
  }

  // Normalize dates to Date objects (handle serialized dates from server)
  const normalizedValues = portfolioValues.map((point) => ({
    ...point,
    date: ensureDate(point.date),
    cashFlows: point.cashFlows.map((cf) => ({
      ...cf,
      date: ensureDate(cf.date),
    })),
  }));

  // Sort by date
  const sortedValues = [...normalizedValues].sort((a, b) => toDateOnlyTimestamp(a.date) - toDateOnlyTimestamp(b.date));

  const startPoint = sortedValues[0];
  const initialValue = startPoint?.portfolioValue || 0;
  let initialDate = startPoint?.date;

  // OPTIMIZATION: Pre-extract and sort all cash flows from all date points
  // This avoids the O(D²) nested loop that re-collects cash flows for each date point
  // Cash flows are already in correct IRR convention: buys negative, sells positive
  const allCashFlows: CashFlow[] = [];
  for (const point of sortedValues) {
    for (const cf of point.cashFlows) {
      allCashFlows.push({
        date: cf.date,
        amount: cf.amount, // Already correct: buys negative (out), sells positive (in)
      });
    }
  }
  // Sort by date so we can break early when iterating
  allCashFlows.sort((a, b) => toDateOnlyTimestamp(a.date) - toDateOnlyTimestamp(b.date));

  if (!initialDate) {
    return [];
  }

  if (initialValue === 0) {
    const firstCashFlow = allCashFlows[0];
    if (firstCashFlow) {
      initialDate = firstCashFlow.date;
    }
  }

  // If portfolio has no value and no transactions, return zero returns
  if (initialValue === 0 && allCashFlows.length === 0) {
    return sortedValues.map((point) => ({
      date: point.date,
      return: 0,
      portfolioValue: point.portfolioValue,
    }));
  }

  const mwrPoints: ReturnPoint[] = [];
  const initialDateKey = toDateOnlyTimestamp(initialDate);

  // Calculate MWR for each date point
  for (let i = 0; i < sortedValues.length; i++) {
    const currentPoint = sortedValues[i];
    const currentDate = currentPoint.date;
    const currentValue = currentPoint.portfolioValue;
    const currentDateKey = toDateOnlyTimestamp(currentDate);

    // For dates before the initial investment date, return 0
    if (currentDateKey < initialDateKey) {
      mwrPoints.push({
        date: currentDate,
        return: 0,
        portfolioValue: currentValue,
      });
      continue;
    }

    // Build cash flows array for IRR calculation
    const cashFlows: CashFlow[] = [];

    // Add initial value as negative cash flow (represents the starting investment)
    // This is the "cost basis" of what was already in the portfolio at the start date
    if (initialValue > 0) {
      cashFlows.push({
        date: initialDate,
        amount: -initialValue, // Negative: money "invested" at start
      });
    }

    const includeOnInitialDate = initialValue === 0;

    // Iterate cash flows up to current date (sorted, so we can stop early)
    for (const cf of allCashFlows) {
      const cashFlowDateKey = toDateOnlyTimestamp(cf.date);
      if (cashFlowDateKey > currentDateKey) {
        break; // allCashFlows is sorted, so we can stop early
      }
      // Only include cash flows that are AFTER the initial date
      // to avoid double-counting the initial investment
      if (includeOnInitialDate ? cashFlowDateKey >= initialDateKey : cashFlowDateKey > initialDateKey) {
        cashFlows.push(cf);
      }
    }

    // Add final value as positive cash flow (what you could withdraw today)
    cashFlows.push({
      date: currentDate,
      amount: currentValue, // Positive: money coming back
    });

    // Calculate IRR for this set of cash flows
    const irr = calculateIRR(cashFlows, initialDate, currentDate);
    const years = Math.max(0, (currentDateKey - initialDateKey) / (1000 * 60 * 60 * 24 * 365.25));
    const cumulativeReturn = years > 0 ? Math.pow(1 + irr, years) - 1 : 0;

    mwrPoints.push({
      date: currentDate,
      return: cumulativeReturn * 100, // Convert to percentage
      portfolioValue: currentValue,
    });
  }

  return mwrPoints;
}

/**
 * Simplified MWR calculation for a single period (start to end).
 * Used when we only need the final return value.
 */
export function calculateMoneyWeightedReturnForPeriod(portfolioValues: PortfolioValuePoint[]): number {
  if (portfolioValues.length < 2) {
    return 0;
  }

  // Normalize dates to Date objects
  const normalizedValues = portfolioValues.map((point) => ({
    ...point,
    date: ensureDate(point.date),
    cashFlows: point.cashFlows.map((cf) => ({
      ...cf,
      date: ensureDate(cf.date),
    })),
  }));

  const sortedValues = [...normalizedValues].sort((a, b) => toDateOnlyTimestamp(a.date) - toDateOnlyTimestamp(b.date));

  const startPoint = sortedValues[0];
  const initialValue = startPoint?.portfolioValue || 0;
  const finalValue = sortedValues[sortedValues.length - 1]?.portfolioValue || 0;
  let initialDate = startPoint?.date;
  const finalDate = sortedValues[sortedValues.length - 1]?.date;

  if (!initialDate || !finalDate) {
    return 0;
  }

  // Pre-extract cash flows to find the first investment date
  const allCashFlows: CashFlow[] = [];
  sortedValues.forEach((point) => {
    point.cashFlows.forEach((cf) => {
      allCashFlows.push({
        date: cf.date,
        amount: cf.amount,
      });
    });
  });
  allCashFlows.sort((a, b) => toDateOnlyTimestamp(a.date) - toDateOnlyTimestamp(b.date));

  if (initialValue === 0) {
    const firstCashFlow = allCashFlows[0];
    if (firstCashFlow) {
      initialDate = firstCashFlow.date;
    }
  }

  if (initialValue === 0 && allCashFlows.length === 0) {
    return 0;
  }

  const includeOnInitialDate = initialValue === 0;

  const cashFlows: CashFlow[] = [];

  // Initial value as negative cash flow (the investment at start)
  if (initialValue > 0) {
    cashFlows.push({
      date: initialDate,
      amount: -initialValue,
    });
  }

  // Add all intermediate cash flows (already in correct convention: buys negative, sells positive)
  const initialDateKey = toDateOnlyTimestamp(initialDate);
  allCashFlows.forEach((cf) => {
    const cashFlowDateKey = toDateOnlyTimestamp(cf.date);
    // Only include cash flows AFTER initial date to avoid double-counting
    if (includeOnInitialDate ? cashFlowDateKey >= initialDateKey : cashFlowDateKey > initialDateKey) {
      cashFlows.push({
        date: cf.date,
        amount: cf.amount, // Already correct: buys negative, sells positive
      });
    }
  });

  // Final value as positive cash flow (what you could withdraw)
  cashFlows.push({
    date: finalDate,
    amount: finalValue,
  });

  const irr = calculateIRR(cashFlows, initialDate, finalDate);
  const years = Math.max(
    0,
    (toDateOnlyTimestamp(finalDate) - toDateOnlyTimestamp(initialDate)) / (1000 * 60 * 60 * 24 * 365.25)
  );
  const cumulativeReturn = years > 0 ? Math.pow(1 + irr, years) - 1 : 0;
  return cumulativeReturn * 100; // Convert to percentage
}

/**
 * Calculates Simple Return for a portfolio.
 * Simple Return here is total return relative to total invested capital:
 * (Current Value + Total Outflows - Total Inflows) / Total Inflows
 *
 * Algorithm:
 * 1. Track cumulative inflows/outflows (buys negative, sells/dividends positive)
 * 2. For each date point, calculate: (Current Value + Outflows - Inflows) / Inflows * 100
 */
export function calculateSimpleReturn(portfolioValues: PortfolioValuePoint[]): ReturnPoint[] {
  if (portfolioValues.length === 0) {
    return [];
  }

  // Normalize dates to Date objects (handle serialized dates from server)
  const normalizedValues = portfolioValues.map((point) => ({
    ...point,
    date: ensureDate(point.date),
    cashFlows: point.cashFlows.map((cf) => ({
      ...cf,
      date: ensureDate(cf.date),
    })),
  }));

  // Sort by date
  const sortedValues = [...normalizedValues].sort((a, b) => toDateOnlyTimestamp(a.date) - toDateOnlyTimestamp(b.date));

  const firstPoint = sortedValues[0];
  const initialDateKey = firstPoint ? toDateOnlyTimestamp(firstPoint.date) : null;
  const hasInitialDateBuy =
    firstPoint && initialDateKey !== null
      ? firstPoint.cashFlows.some((cf) => cf.amount < 0 && toDateOnlyTimestamp(cf.date) === initialDateKey)
      : false;

  // If the period starts with a buy on the same date, contributions are tracked
  // from cash flows. Otherwise, include the opening market value as starting capital.
  const openingCapital = hasInitialDateBuy ? 0 : firstPoint?.portfolioValue || 0;

  let totalInflow = openingCapital;
  let totalOutflow = 0;
  let firstInvestmentDateKey: number | null = null;

  const returnPoints: ReturnPoint[] = [];
  for (const point of sortedValues) {
    const pointDateKey = toDateOnlyTimestamp(point.date);

    for (const cf of point.cashFlows) {
      if (cf.amount < 0) {
        totalInflow += Math.abs(cf.amount);
        if (firstInvestmentDateKey === null) {
          firstInvestmentDateKey = toDateOnlyTimestamp(cf.date);
        }
      } else if (cf.amount > 0) {
        totalOutflow += cf.amount;
      }
    }

    const currentValue = point.portfolioValue;
    const invested = totalInflow;
    const totalReturn = currentValue + totalOutflow - invested;
    let returnValue = invested > 0 ? (totalReturn / invested) * 100 : 0;

    // Baseline the chart at 0% on the first contribution date only when the
    // period starts from zero capital (fresh investment within range).
    if (openingCapital === 0 && firstInvestmentDateKey !== null && pointDateKey === firstInvestmentDateKey) {
      returnValue = 0;
    }

    returnPoints.push({
      date: point.date,
      return: returnValue,
      portfolioValue: currentValue,
    });
  }

  return returnPoints;
}
