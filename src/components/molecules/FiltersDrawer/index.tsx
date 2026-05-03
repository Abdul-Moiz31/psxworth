import { Button, ButtonProps } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Filter } from "lucide-react";
import { ReactNode, useState } from "react";

type FiltersDrawerProps = {
  title: string;
  children: ReactNode;
  hasActiveFilters?: boolean;
  triggerLabel?: string;
  triggerProps?: ButtonProps;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showDoneButton?: boolean;
  doneLabel?: string;
  onDone?: () => void;
};

export const FiltersDrawer = ({
  title,
  children,
  hasActiveFilters = false,
  triggerLabel = "Filters",
  triggerProps,
  open,
  onOpenChange,
  showDoneButton = true,
  doneLabel = "Done",
  onDone,
}: FiltersDrawerProps) => {
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = typeof open === "boolean";
  const resolvedOpen = isControlled ? open : internalOpen;

  const handleOpenChange = (next: boolean) => {
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };

  const handleDone = () => {
    onDone?.();
    handleOpenChange(false);
  };

  const triggerClassName = [
    "relative",
    hasActiveFilters
      ? "bg-primary/10 border-primary/30 hover:bg-primary/20"
      : "bg-slate-700 border-slate-600 hover:bg-slate-600",
    triggerProps?.className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Drawer open={resolvedOpen} onOpenChange={handleOpenChange}>
      <DrawerTrigger asChild>
        <Button variant="outline" size="sm" {...triggerProps} className={triggerClassName}>
          <Filter className="h-4 w-4 mr-2" />
          {triggerLabel}
          {hasActiveFilters && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-background" />
          )}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="bg-slate-900 border-slate-700">
        <DrawerHeader>
          <DrawerTitle className="text-gray-100">{title}</DrawerTitle>
        </DrawerHeader>
        <div className="p-6 space-y-6">
          {children}
          {showDoneButton && (
            <div className="pt-2">
              <Button onClick={handleDone} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                {doneLabel}
              </Button>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default FiltersDrawer;
