"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";
import React, { useState } from "react";
import { HoldToConfirmButton } from "../HoldToConfirm";

interface ConfirmationDialogProps {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
  onConfirm: () => void;
  onCancel?: () => void;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  useHoldToConfirm?: boolean;
  holdDuration?: number;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmText = "Continue",
  cancelText = "Cancel",
  variant = "default",
  onConfirm = () => console.log("Confirmed"),
  onCancel = () => console.log("Cancelled"),
  trigger,
  open,
  onOpenChange,
  useHoldToConfirm = false,
  holdDuration = 2000,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = (newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen);
    } else {
      setIsOpen(newOpen);
    }
  };

  const handleConfirm = () => {
    onConfirm();
    handleOpenChange(false);
  };

  const handleCancel = () => {
    onCancel();
    handleOpenChange(false);
  };

  const isControlled = open !== undefined;
  const dialogOpen = isControlled ? open : isOpen;

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[425px] bg-background border-border">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            {variant === "destructive" && (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
            )}
            <DialogTitle className="text-lg font-semibold text-foreground">{title}</DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
            {description}{" "}
            {useHoldToConfirm && <span className="font-medium text-foreground">(Hold the button to confirm)</span>}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-4">
          <Button variant="outline" onClick={handleCancel} className="w-full sm:w-auto">
            {cancelText}
          </Button>
          {useHoldToConfirm ? (
            <HoldToConfirmButton
              onConfirm={handleConfirm}
              holdDuration={holdDuration}
              variant={variant === "destructive" ? "danger" : "primary"}
              className="w-full sm:w-auto"
            >
              {confirmText}
            </HoldToConfirmButton>
          ) : (
            <Button variant={variant} onClick={handleConfirm} className="w-full sm:w-auto">
              {confirmText}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { ConfirmationDialog };
