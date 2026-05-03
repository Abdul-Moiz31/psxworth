"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { TransactionFormDialog } from "./TransactionForm/TransactionFormDialog/TransactionFormDialog";

interface AddTransactionProps {
  portfolioId: number;
  fullWidth?: boolean;
  wrapperClassName?: string;
  buttonClassName?: string;
}

export const AddTransaction = (props: AddTransactionProps) => {
  const { portfolioId, fullWidth = false, wrapperClassName, buttonClassName } = props;
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  return (
    <div className={cn(fullWidth ? "w-full" : "w-fit", wrapperClassName)}>
      <Button
        onClick={() => {
          setIsTransactionDialogOpen(true);
        }}
        variant="outline"
        className={cn(fullWidth && "w-full", buttonClassName)}
      >
        Add Transaction
      </Button>
      <TransactionFormDialog
        open={isTransactionDialogOpen}
        onOpenChange={setIsTransactionDialogOpen}
        portfolioId={portfolioId}
      />
    </div>
  );
};

export default AddTransaction;
