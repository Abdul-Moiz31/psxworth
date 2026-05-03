"use client";

import { ResponsiveDialog } from "@/components/ui/ResponsiveDialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { ImportTransactionsContent } from "./components/ImportTransactionsContent";

interface ImportTransactionsProps {
  fullWidth?: boolean;
  wrapperClassName?: string;
  buttonClassName?: string;
}

export function ImportTransactions({ fullWidth = false, wrapperClassName, buttonClassName }: ImportTransactionsProps) {
  const [isOpen, setIsOpen] = useState(false); // Control drawer/dialog open state

  return (
    <>
      <div className={cn(fullWidth ? "w-full" : "w-fit", wrapperClassName)}>
        <Button
          onClick={() => setIsOpen(true)}
          variant="outline"
          className={cn(fullWidth && "w-full", buttonClassName)}
        >
          Import Transactions
        </Button>
      </div>
      <ResponsiveDialog
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        title="Import Transactions"
        className="sm:max-w-[650px] p-0 bg-slate-900/90 border-slate-700 text-slate-100 backdrop-blur-sm"
        closeOnOutsideClick
      >
        <ScrollArea className="h-full overflow-y-scroll">
          <ImportTransactionsContent onCloseDialog={() => setIsOpen(false)} />
        </ScrollArea>
      </ResponsiveDialog>
    </>
  );
}
