"use client";

import VisuallyHidden from "@/components/VisuallyHidden";
import { ResponsiveDialog } from "@/components/ui/ResponsiveDialog";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Portfolio } from "@/db/schema";
import { useRouter } from "next/navigation";
import React, { useCallback, useState } from "react";
import CreatePortfolioForm from "../CreatePortfolioForm";

type CreatePortfolioDialogProps = {
  trigger?: React.ReactNode;
  navigateOnSuccess?: boolean;
  portfolio?: Portfolio;
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export const CreatePortfolioDialog = ({
  trigger,
  navigateOnSuccess = false,
  portfolio,
  children,
  open,
  onOpenChange,
}: CreatePortfolioDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const router = useRouter();

  const isOpen = open ?? internalOpen;
  const setIsOpen = onOpenChange ?? setInternalOpen;

  const onSuccess = useCallback(
    (newPortfolio: any) => {
      if (navigateOnSuccess) {
        router.push(`/portfolio/${newPortfolio.id}`);
      }
      setIsOpen(false);
    },
    [navigateOnSuccess, router, setIsOpen]
  );

  const title = portfolio ? "Edit Portfolio" : "Add New Portfolio";

  const handleTriggerClick = useCallback(() => {
    setIsOpen(true);
  }, [setIsOpen]);

  const triggerElement = trigger ? (
    React.isValidElement(trigger) ? (
      React.cloneElement(trigger as React.ReactElement<any>, {
        onClick: (e: React.MouseEvent) => {
          handleTriggerClick();
          const originalOnClick = (trigger as React.ReactElement<any>).props?.onClick;
          if (originalOnClick && typeof originalOnClick === "function") {
            originalOnClick(e);
          }
        },
      })
    ) : (
      <div onClick={handleTriggerClick}>{trigger}</div>
    )
  ) : null;

  return (
    <>
      {triggerElement}
      {children}
      <ResponsiveDialog
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        title={title}
        className="bg-slate-800 border-slate-700 text-slate-100 w-full sm:max-w-xl py-4 px-4 sm:max-h-[600px] sm:h-[600px] backdrop-blur-sm overflow-y-auto flex flex-col h-auto max-h-[90vh]"
      >
        <DialogHeader className="pb-2 pt-0">
          <DialogTitle className="text-slate-100 text-center text-xl">{title}</DialogTitle>
        </DialogHeader>
        <VisuallyHidden>
          <DialogTitle>{portfolio ? "Edit Portfolio" : "Create Portfolio"}</DialogTitle>
        </VisuallyHidden>
        <CreatePortfolioForm onSuccess={onSuccess} portfolio={portfolio} />
      </ResponsiveDialog>
    </>
  );
};

export default CreatePortfolioDialog;
