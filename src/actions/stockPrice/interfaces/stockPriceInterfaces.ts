export interface StockPrice {
  price: number;
  symbol: string;
  updatedAt: Date;
}

export interface StockPrices {
  [symbol: string]: StockPrice;
}

export interface StockPreviousClose {
  previousClose: number;
  date: Date;
}

export interface StockPreviousCloses {
  [symbol: string]: StockPreviousClose;
}
