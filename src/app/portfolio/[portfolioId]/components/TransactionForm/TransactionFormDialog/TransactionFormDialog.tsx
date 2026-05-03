"use client";

import { AnimateChangeInHeight } from "@/components/molecules/AnimateChangeInHeight";
import { ResponsiveDialog } from "@/components/ui/ResponsiveDialog";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Transaction } from "@/types";
import { useCallback } from "react";
import TransactionForm from "../TransactionForm";

type TransactionFormDialogProps = {
  open: boolean;
  portfolioId: number;
  onOpenChange: (open: boolean) => void;
  editTransaction?: Transaction;
};

export function TransactionFormDialog(props: TransactionFormDialogProps) {
  const { open, onOpenChange, portfolioId, editTransaction } = props;

  const handleSuccess = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const title = editTransaction ? "Edit Transaction" : "Add New Transaction";

  return (
    <ResponsiveDialog
      isOpen={open}
      setIsOpen={onOpenChange}
      title={title}
      className="bg-slate-900/90 border-slate-700 text-slate-100 w-full sm:max-w-xl py-4 px-4 sm:max-h-fit backdrop-blur-sm overflow-y-auto flex flex-col h-auto max-h-[90vh]"
    >
      <AnimateChangeInHeight>
        <DialogHeader className="pb-2 pt-0 px-1">
          <DialogTitle className="text-slate-100 text-xl">{title}</DialogTitle>
        </DialogHeader>
        <div className="flex-grow">
          <TransactionForm
            portfolioId={portfolioId}
            onSuccess={handleSuccess}
            editTransaction={editTransaction}
            editTransactionId={editTransaction?.id}
          />
        </div>
      </AnimateChangeInHeight>
    </ResponsiveDialog>
  );
}
