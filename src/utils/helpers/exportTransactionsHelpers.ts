import { Transaction } from "@/types";
import { coerceToDatePreservingLocalDate, isLocalDate } from "@/types/localDate";
import { formatCurrency, formatDate } from "@/utils/helpers/formatHelpers";
import { calculateTotalValue, calculateCommissionAndTaxes } from "@/utils/helpers/transactionsHelpers";

interface ExportOptions {
  dateFormat?: "iso" | "formatted";
  includeHeaders?: boolean;
  currencyFormat?: "formatted" | "raw";
}

interface ExportMetadata {
  exportDate: string;
  portfolioId: number;
  totalRecords: number;
  filters?: {
    types?: string[];
    symbols?: string[];
  };
}

/**
 * Converts a transaction to CSV row format
 */
function transactionToCSVRow(transaction: Transaction, options: ExportOptions = {}): string[] {
  const { dateFormat = "formatted", currencyFormat = "formatted" } = options;

  const formatValue = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "";
    return currencyFormat === "formatted" ? formatCurrency(value) : value.toString();
  };

  const formatDateValue = (date: Date | string) => {
    if (dateFormat !== "iso") {
      return formatDate(date);
    }

    if (typeof date === "string" && isLocalDate(date)) {
      return date;
    }

    if (date instanceof Date) {
      return date.toISOString();
    }

    return coerceToDatePreservingLocalDate(date).toISOString();
  };

  // Calculate total value and commission using helper functions
  const totalValue = calculateTotalValue(transaction);
  const commissionValue = calculateCommissionAndTaxes(transaction);

  return [
    transaction.type,
    formatDateValue(transaction.transactionDate),
    transaction.stockSymbol,
    transaction.numberOfShares.toString(),
    formatValue(transaction.type === "dividend" ? null : transaction.pricePerShare),
    formatValue(transaction.type === "dividend" ? transaction.dividendPerShare : null),
    formatValue(commissionValue),
    formatValue(totalValue),
    transaction.note || "",
  ];
}

/**
 * Gets CSV headers for transactions
 */
function getCSVHeaders(): string[] {
  return [
    "Type",
    "Transaction Date",
    "Stock Symbol",
    "Number of Shares",
    "Price per Share",
    "Dividend per Share",
    "Commission/Taxes",
    "Total Value",
    "Note",
  ];
}

/**
 * Exports transactions to CSV format
 */
export function exportTransactionsToCSV(transactions: Transaction[], options: ExportOptions = {}): string {
  const { includeHeaders = true } = options;
  const headers = includeHeaders ? getCSVHeaders() : [];
  const rows = transactions.map((transaction) => transactionToCSVRow(transaction, options));
  const headerRow = headers.map((header: string) => `"${header}"`).join(",");
  const dataRows = rows.map((row) => row.map((cell: string) => `"${cell}"`).join(","));

  const csvContent = includeHeaders ? [headerRow, ...dataRows].join("\n") : dataRows.join("\n");
  return csvContent;
}

/**
 * Downloads CSV content as a file
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

/**
 * Generates filename for transaction export
 */
export function generateExportFilename(isCurrentView: boolean, totalRecords: number): string {
  const timestamp = new Date().toISOString().split("T")[0];
  const viewType = isCurrentView ? "current-view" : "all-transactions";
  return `transactions-${viewType}-${totalRecords}-records-${timestamp}.csv`;
}

/**
 * Creates export metadata
 */
export function createExportMetadata(
  portfolioId: number,
  totalRecords: number,
  filters?: { types?: string[]; symbols?: string[] }
): ExportMetadata {
  return {
    exportDate: new Date().toISOString(),
    totalRecords,
    filters,
    portfolioId,
  };
}
