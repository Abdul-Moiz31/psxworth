"use client";

import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/animate-ui/components/radix/sidebar";
import { toast } from "@/components/molecules/Toast";
import { PWA_INSTALL_ACCEPTED } from "@/utils/posthog/events";
import { CheckCircle2, Download, Loader2 } from "lucide-react";
import posthog from "posthog-js";
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

export const SidebarInstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installState, setInstallState] = useState<"checking" | "available" | "installed" | "unavailable">("checking");

  useEffect(() => {
    const INSTALLED_FLAG_KEY = "pwa_installed";

    // Check if already installed (standalone mode)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true);
    if (isStandalone) {
      const rafId = window.requestAnimationFrame(() => setInstallState("installed"));
      return () => window.cancelAnimationFrame(rafId);
    }

    // If installation was previously confirmed in this browser profile, treat as installed.
    if (window.localStorage.getItem(INSTALLED_FLAG_KEY) === "true") {
      const rafId = window.requestAnimationFrame(() => setInstallState("installed"));
      return () => window.cancelAnimationFrame(rafId);
    }

    // Fallback: if no install prompt event arrives, stop spinner.
    const loadingTimeout = window.setTimeout(() => {
      setInstallState((current) => (current === "checking" ? "unavailable" : current));
    }, 2500);

    const handleBeforeInstallPrompt = (event: BeforeInstallPromptEvent) => {
      event.preventDefault();
      setDeferredPrompt(event);
      setInstallState("available");
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setInstallState("installed");
      window.localStorage.setItem(INSTALLED_FLAG_KEY, "true");
      window.clearTimeout(loadingTimeout);
      posthog.capture(PWA_INSTALL_ACCEPTED);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.clearTimeout(loadingTimeout);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt || installState !== "available") return;

    try {
      await deferredPrompt.prompt();
    } catch (error) {
      toast({
        type: "error",
        title: "Error during PWA installation",
        description: error instanceof Error ? error.message : String(error),
      });
      posthog.captureException(
        new Error(`Error during PWA installation: ${error instanceof Error ? error.message : String(error)}`)
      );
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          onClick={handleInstallClick}
          disabled={installState !== "available"}
          tooltip={
            installState === "installed"
              ? "PWA already installed"
              : installState === "available"
                ? "Install App"
                : installState === "unavailable"
                  ? "App already installed or install prompt unavailable in this browser context"
                  : "Checking install status..."
          }
        >
          {installState === "checking" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : installState === "installed" || installState === "unavailable" ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          <span>
            {installState === "installed"
              ? "App Installed"
              : installState === "unavailable"
                ? "Installed"
                : "Install App"}
          </span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

export default SidebarInstallButton;
