import { getStocksInfo } from "@/actions/stocksInfo/stocksInfoActions";
import { toast } from "@/components/molecules/Toast";
import { StockInfo } from "@/types";
import { useEffect, useState } from "react";

export const useStocksInfo = () => {
  const [stocks, setStocks] = useState<StockInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStocks = async () => {
      try {
        const stocksInfo = await getStocksInfo();
        if (stocksInfo.success) {
          setStocks(stocksInfo.data as StockInfo[]);
        } else {
          toast({
            type: "error",
            title: "Failed to load stock data",
            description: stocksInfo.message,
          });
        }
      } catch (error) {
        console.error("Failed to load stock data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStocks();
  }, []);

  return {
    stocksInfo: stocks,
    isLoading,
  };
};
