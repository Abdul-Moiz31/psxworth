"use server";

import { ServerFunctionResponse, StockInfo } from "@/types";
import { STOCKS_INFO } from "@/utils/constants/stockSymbols";
import { captureException } from "@/utils/posthog/helpers";
import { cache } from "react";

/**
 * Server action to get the stocks symbols with minimum info.
 */
export const getStocksInfo = cache(async (): Promise<ServerFunctionResponse> => {
  try {
    return {
      success: true,
      message: "Stock info fetched successfully",
      status: 200,
      data: STOCKS_INFO as StockInfo[],
    };
  } catch (error: any) {
    captureException(error);
    return {
      success: false,
      message: error.message || "Error fetching stock info",
      status: 500,
    };
  }
});
