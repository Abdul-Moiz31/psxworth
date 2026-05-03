"use client";

import GradientButton from "@/components/ui/gradient-button";
import SpinningLoader from "@/components/ui/spinning-loader";

type TransactionType = "buy" | "sell" | "dividend";

interface TransactionSubmitButtonProps {
  transactionType: TransactionType;
  isPending: boolean;
  isEditFlow: boolean;
}

export function TransactionSubmitButton({ transactionType, isPending, isEditFlow }: TransactionSubmitButtonProps) {
  const getButtonConfig = () => {
    if (isEditFlow) {
      return {
        text: "Save Changes",
      };
    }

    switch (transactionType) {
      case "buy":
        return {
          text: "Buy Shares",
        };
      case "sell":
        return {
          text: "Sell Shares",
        };
      case "dividend":
        return {
          text: "Add Dividend",
        };
    }
  };

  const buttonConfig = getButtonConfig();
  const isLoading = isPending;

  return (
    <GradientButton fullWidth type="submit" variant="cyanBlue" disabled={isLoading} aria-disabled={isLoading}>
      {isLoading ? <SpinningLoader size="xxs" color="blue" /> : buttonConfig.text}
    </GradientButton>
  );
}
