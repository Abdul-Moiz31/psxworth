"use client";

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/animate-ui/components/radix/sidebar";
import { cn } from "@/lib/utils";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { LogIn } from "lucide-react";
import { KeyboardEvent, useCallback, useRef } from "react";

export const SidebarUserSection = () => {
  const accountRowRef = useRef<HTMLDivElement>(null);

  const openUserMenu = useCallback(() => {
    const trigger = accountRowRef.current?.querySelector("button,[role='button']") as HTMLElement | null;
    trigger?.click();
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openUserMenu();
      }
    },
    [openUserMenu]
  );

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SignedOut>
          <SignInButton mode="modal">
            <SidebarMenuButton>
              <LogIn className="h-4 w-4" />
              <span>Sign In</span>
            </SidebarMenuButton>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <div
            ref={accountRowRef}
            role="button"
            tabIndex={0}
            onClick={openUserMenu}
            onKeyDown={handleKeyDown}
            className={cn(
              "flex w-full cursor-pointer items-center gap-2 rounded-md p-2 text-sm",
              "outline-hidden focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
              "border border-sidebar-border/60 bg-sidebar-accent/35"
            )}
          >
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-7 w-7",
                },
              }}
            />
            <span className="text-sidebar-foreground">My Account</span>
          </div>
        </SignedIn>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

export default SidebarUserSection;
