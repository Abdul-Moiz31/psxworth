import { ReturnType, Scope } from "./types";

export const returnTypeLabels: Record<ReturnType, string> = {
  twr: "TWR",
  mwr: "MWR",
  simple: "Simple",
};

export const scopeLabels: Record<Scope, string> = {
  portfolio: "Portfolio",
  stock: "Stock",
};
