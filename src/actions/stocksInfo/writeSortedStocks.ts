//This is helper function used to sort all stocks.
// "use server";

// import { STOCKS_INFO } from "@/utils/constants/stockSymbols";
// import { writeFile } from "fs/promises";
// import path from "path";

// export async function writeSortedStocksToFile() {
//   const sortedStocks = [...STOCKS_INFO].sort((a, b) =>
//     a.symbol.localeCompare(b.symbol)
//   );

//   const filePath = path.join(process.cwd(), "src/app/temp", "sorted_stocks_output.ts");
//   const fileContent = `export const SORTED_STOCKS_INFO_OUTPUT = ${JSON.stringify(sortedStocks, null, 2)};\n`;

//   try {
//     await writeFile(filePath, fileContent, "utf-8");
//     console.log("Sorted stocks written to:", filePath);
//     return { success: true, message: "Sorted stocks written successfully." };
//   } catch (error) {
//     console.error("Error writing sorted stocks to file:", error);
//     return { success: false, message: "Failed to write sorted stocks." };
//   }
// }
