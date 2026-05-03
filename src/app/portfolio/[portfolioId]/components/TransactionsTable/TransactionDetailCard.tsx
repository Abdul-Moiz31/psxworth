import { Transaction } from "@/types";
import { formatCurrency, formatDate } from "@/utils/helpers/formatHelpers";

interface TransactionDetailCardProps {
  transaction: Transaction;
}

export const TransactionDetailCard = (props: TransactionDetailCardProps) => {
  const { transaction: data } = props;

  // Calculate total value based on transaction type
  let totalValue = 0;
  let grossValue = 0;

  if (data.type === "buy" || data.type === "sell") {
    totalValue = data.pricePerShare * data.numberOfShares;
    grossValue = totalValue;
  } else if (data.type === "dividend") {
    grossValue = data.dividendPerShare * data.numberOfShares;
    // For dividends, totalValue should be net amount (after commission/taxes)
    const commissionAndTaxes = data.commissionAndTaxes
      ? data.isCommissionPercentage
        ? (data.commissionAndTaxes / 100) * grossValue
        : data.commissionAndTaxes
      : 0;
    totalValue = grossValue - commissionAndTaxes;
  }

  // Calculate actual commission amount if it's a percentage
  const actualCommissionAmount =
    (data.commissionAndTaxes ?? 0) !== undefined && data.isCommissionPercentage
      ? (grossValue * (data.commissionAndTaxes ?? 0)) / 100
      : (data.commissionAndTaxes ?? 0);

  // Calculate total with commission if present
  const totalWithCommission =
    data.type === "sell"
      ? grossValue - actualCommissionAmount
      : data.type === "dividend"
        ? totalValue // For dividends, this is already net amount
        : grossValue + actualCommissionAmount;

  return (
    <div className="bg-slate-800 rounded-lg shadow-lg p-3 border border-slate-700">
      <div className="flex flex-col gap-4">
        {/* Header with transaction type and date */}
        <div className="flex justify-between items-center border-b border-slate-700 pb-3">
          <h3 className="text-lg font-semibold text-gray-100 capitalize">{data.type} Transaction</h3>
          <span className="text-slate-400">{formatDate(data.transactionDate)}</span>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="text-sm text-slate-400">Basic Information</div>
            <div className="flex justify-between">
              <span>Stock Symbol:</span>
              <span className="font-medium">{data.stockSymbol}</span>
            </div>
            <div className="flex justify-between">
              <span>Number of Shares:</span>
              <span className="font-medium">{data.numberOfShares.toLocaleString()}</span>
            </div>
            {(data.type === "buy" || data.type === "sell") && (
              <div className="flex justify-between">
                <span>Price per Share:</span>
                <span className="font-medium">{formatCurrency(data.pricePerShare)}</span>
              </div>
            )}
            {data.type === "dividend" && (
              <div className="flex justify-between">
                <span>Dividend per Share:</span>
                <span className="font-medium">{formatCurrency(data.dividendPerShare)}</span>
              </div>
            )}
            {data.type === "dividend" && (
              <div className="flex justify-between">
                <span>Gross Dividend:</span>
                <span className="font-medium">{formatCurrency(grossValue)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>{data.type === "dividend" ? "Net Dividend:" : "Total Value:"}</span>
              <span className="font-medium">{formatCurrency(totalValue)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-slate-400">Commission & Taxes</div>
            {data.commissionAndTaxes !== undefined ? (
              <>
                <div className="flex justify-between">
                  <span>Commission and Taxes:</span>
                  <span className="font-medium">
                    {formatCurrency(actualCommissionAmount ?? 0)}
                    {data.isCommissionPercentage && ` (${formatCurrency(data.commissionAndTaxes)}%)`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span className="font-medium">{data.isCommissionPercentage ? "Percentage" : "Fixed Amount"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total with Commission:</span>
                  <span className="font-medium">{formatCurrency(totalWithCommission)}</span>
                </div>
              </>
            ) : (
              <div className="text-slate-500 italic">No commission or taxes</div>
            )}
          </div>

          {data.note && (
            <div className="space-y-2">
              <div className="text-sm text-slate-400">Note</div>
              <div className="text-slate-200 whitespace-pre-wrap">{data.note}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
