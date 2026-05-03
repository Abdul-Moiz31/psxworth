/**
 * This helper file is to compare the stocksInfo with the allSymbols and find the
 * stocks that are not in the stocksInfo.
 *
 * This is a temporary file and will be removed after the stocksInfo is updated.
 * It then sorts the stocksinfo and write it to a file.
 *
 *
 * Use it like this-
 * . Create All symbols file from data from psx.
 * . Get symbols which are missing in stocks info.
 * . Add them to stocks Info
 * . Sort the symbols.
 * . Replace stocks info with sorted.
 */
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

// import { getLatestAllStocksPrices } from "@/actions/stockPrice/stockPriceActions";
// import { writeSortedStocksToFile } from "@/actions/stocksInfo/writeSortedStocks";
// import { allSymbols } from "@/utils/constants/allSymbols";
// import { STOCKS_INFO } from "@/utils/constants/stockSymbols";

// // Import allSymbols

// export default async function TempPage() {
//   const response = await getLatestAllStocksPrices();

//   if (!response.success || !response.data) {
//     return (
//       <div>
//         <h1>Error fetching stock prices</h1>
//         <p>{response.message || "Unknown error"}</p>
//       </div>
//     );
//   }

//   const latestPrices = response.data;
//   const stockInfoSymbols = new Set(STOCKS_INFO.map((stock) => stock.symbol));
//   const allSymbolsMap = new Map(allSymbols.map((stock) => [stock.symbol, stock]));

//   const stocksToDisplay: typeof allSymbols = [];
//   for (const symbol in latestPrices) {
//     // Filter out symbols ending with "XD" and check if not in STOCKS_INFO
//     if (!symbol.endsWith("XD") && !stockInfoSymbols.has(symbol)) {
//       const stockData = allSymbolsMap.get(symbol);
//       if (stockData) {
//         stocksToDisplay.push(stockData);
//       }
//     }
//   }

//   // Log to console as requested
//   console.log("Stocks not in STOCKS_INFO (excluding XD):", stocksToDisplay);

//   // Call the server action to write sorted stocks to a file
//   await writeSortedStocksToFile();

//   return (
//     <div>
//       <h1>Stock Symbols Not in STOCKS_INFO (excluding XD)</h1>
//       {stocksToDisplay.length > 0 ? (
//         <ul>
//           {stocksToDisplay.map((stock) => (
//             <li key={stock.symbol}>
//               <strong>Symbol:</strong> {stock.symbol}, <strong>Name:</strong> {stock.name}, <strong>Sector:</strong>{" "}
//               {stock.sectorName}, <strong>ETF:</strong> {String(stock.isETF)}, <strong>Debt:</strong>{" "}
//               {String(stock.isDebt)}, <strong>GEM:</strong> {String(stock.isGEM)}
//             </li>
//           ))}
//         </ul>
//       ) : (
//         <p>No stock symbols found that are in prices but not in STOCKS_INFO (excluding XD).</p>
//       )}
//     </div>
//   );
// }

export default function TempPage() {
  //Redirect to /portfolio
  redirect("/portfolio");
}
