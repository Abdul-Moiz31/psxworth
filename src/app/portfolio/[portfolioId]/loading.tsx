import { SidebarTrigger } from "@/components/animate-ui/components/radix/sidebar";
import { Loader2 } from "lucide-react";

const tabClassName =
  "text-sidebar-foreground/80 bg-transparent h-full rounded-none rounded-t border border-transparent px-2 py-2 text-xs whitespace-nowrap md:px-3 md:text-base";

export default function PortfolioDetailLoading() {
  return (
    <main className="mx-auto flex h-full min-h-0 flex-col px-0 pt-0 pb-0">
      <div className="flex min-h-0 flex-1 flex-col rounded-none border border-sidebar-border/70 bg-sidebar/85 p-0 shadow-[0_10px_40px_rgba(0,0,0,0.25)] backdrop-blur-md">
        <div className="flex shrink-0 flex-col items-stretch gap-2 border-b border-sidebar-border/80 bg-background/10 px-2 py-1.5 md:flex-row md:items-center md:justify-between md:px-3">
          <div className="flex w-full items-center gap-2 md:w-auto">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="size-8 border border-primary/50 bg-sidebar-accent/60 text-sidebar-foreground shadow-sm hover:bg-sidebar-accent" />
              <div className="h-6 w-px bg-sidebar-border/80" />
            </div>
            <div className="no-scrollbar flex h-auto w-full justify-start overflow-x-auto rounded-none border-none bg-transparent p-0 md:w-auto">
              <div
                className={`${tabClassName} border-primary/70 border-b-sidebar bg-sidebar-accent/60 text-sidebar-foreground`}
              >
                Performance
              </div>
              <div className={tabClassName}>Allocation</div>
              <div className={tabClassName}>Payouts</div>
              <div className={tabClassName}>Transactions</div>
            </div>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 items-center justify-center">
          <div className="flex flex-col items-center justify-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-sm text-gray-400">Loading Portfolio Details...</span>
          </div>
        </div>
      </div>
    </main>
  );
}
