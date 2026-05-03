"use client";

import VisuallyHidden from "@/components/VisuallyHidden";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { useBreakpoint } from "@/utils/hooks/useBreakpoints";
import { DialogTitle } from "@radix-ui/react-dialog";
import React from "react";

type ResponsiveDialogProps = {
  children: React.ReactNode;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  title: string; // New prop for the dialog title
  className?: string;
  closeOnOutsideClick?: boolean; // Controls whether clicking outside closes the dialog
};

export function ResponsiveDialog({
  children,
  isOpen,
  setIsOpen,
  title, // Destructure the new title prop
  className,
  closeOnOutsideClick = true, // Default to true for backward compatibility
}: ResponsiveDialogProps) {
  const { isSmall } = useBreakpoint();

  if (isSmall) {
    return (
      <Drawer open={isOpen} onOpenChange={setIsOpen} dismissible={closeOnOutsideClick}>
        <DrawerContent
          className={className}
          overlayProps={
            closeOnOutsideClick
              ? { onPointerDown: () => setIsOpen(false) }
              : { onPointerDown: (event) => event.preventDefault() }
          }
          onPointerDownOutside={closeOnOutsideClick ? undefined : (event) => event.preventDefault()}
          onInteractOutside={closeOnOutsideClick ? undefined : (event) => event.preventDefault()}
        >
          <VisuallyHidden>
            <DialogTitle>{title}</DialogTitle>
          </VisuallyHidden>
          {children}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        className={className}
        onPointerDownOutside={closeOnOutsideClick ? undefined : (e) => e.preventDefault()}
        onInteractOutside={closeOnOutsideClick ? undefined : (e) => e.preventDefault()}
      >
        <VisuallyHidden>
          <DialogTitle>{title}</DialogTitle>
        </VisuallyHidden>
        {children}
      </DialogContent>
    </Dialog>
  );
}
