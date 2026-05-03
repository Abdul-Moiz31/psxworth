"use client";

import { STOCKS_INFO } from "@/utils/constants/stockSymbols";
import { formatCurrency } from "@/utils/helpers/formatHelpers";

interface TransactionSummaryProps {
  transactionType: "buy" | "sell" | "dividend";
  stockSymbol: string;
  numberOfShares: number | undefined;
  pricePerShare: number | undefined;
  dividendPerShare: number | undefined;
  commissionAndTaxes: number | undefined;
  isCommissionPercentage: boolean;
}

export function TransactionSummary({
  transactionType,
  stockSymbol,
  numberOfShares,
  pricePerShare,
  dividendPerShare,
  commissionAndTaxes,
  isCommissionPercentage,
}: TransactionSummaryProps) {
  // Get stock name
  const stock = STOCKS_INFO.find((s) => s.symbol === stockSymbol);
  const stockName = stock?.name || stockSymbol;

  // Check if we have enough data to show summary
  const hasValidData =
    numberOfShares && stockSymbol && (transactionType === "dividend" ? dividendPerShare : pricePerShare);

  // Calculate values if we have valid data
  let totalAmount = 0;
  let commission = 0;
  let netAmount = 0;

  if (hasValidData) {
    if (transactionType === "dividend") {
      totalAmount = numberOfShares! * dividendPerShare!;
    } else {
      totalAmount = numberOfShares! * pricePerShare!;
    }

    // Calculate commission
    if (commissionAndTaxes) {
      if (isCommissionPercentage) {
        commission = (totalAmount * commissionAndTaxes) / 100;
      } else {
        commission = commissionAndTaxes;
      }
    }

    netAmount =
      transactionType === "buy" ? totalAmount + commission : totalAmount - commission;
  }

  const getTypeLabel = () => {
    switch (transactionType) {
      case "buy":
        return "Buying";
      case "sell":
        return "Selling";
      case "dividend":
        return "Dividend";
    }
  };

  const getAmountLabel = () => {
    switch (transactionType) {
      case "buy":
        return "Total Cost";
      case "sell":
        return "Total Proceeds";
      case "dividend":
        return "Net Dividend";
    }
  };

  const perShareAmount = transactionType === "dividend" ? dividendPerShare : pricePerShare;

  return (
    <div className="bg-muted/50 rounded-lg px-3 py-2 border border-border/50 text-sm min-h-[3.5rem] flex items-center">
      {hasValidData ? (
        <div className="text-muted-foreground">
          {getTypeLabel()} <span className="text-foreground font-medium">{numberOfShares}</span> shares of{" "}
          <span className="text-foreground font-medium">{stockName}</span> at{" "}
          <span className="text-foreground font-medium">PKR {formatCurrency(perShareAmount!)}</span> for{" "}
          <span className="text-muted-foreground font-semibold">{getAmountLabel().toLowerCase()}</span>{" "}
          <span className="text-foreground font-bold">PKR {formatCurrency(netAmount)}</span>
        </div>
      ) : (
        <div className="text-muted-foreground italic">Fill in the required fields to see transaction summary</div>
      )}
    </div>
  );
}
