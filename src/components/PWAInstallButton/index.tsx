"use client";

import { PWA_INSTALL_ACCEPTED } from "@/utils/posthog/events";
import { Download, Loader2 } from "lucide-react";
import posthog from "posthog-js";
import { useEffect, useState } from "react";
import { toast } from "../molecules/Toast";
import { Button } from "../ui/button";

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

const PWAInstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null | undefined>(undefined);

  useEffect(() => {
    // Check if already installed (standalone mode)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true);
    if (isStandalone) {
      setTimeout(() => setDeferredPrompt(null), 0);
      return; // Already installed, no need to set up listeners
    }

    const handleBeforeInstallPrompt = (event: BeforeInstallPromptEvent) => {
      event.preventDefault();
      setDeferredPrompt(event);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      posthog.capture(PWA_INSTALL_ACCEPTED);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

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

  if (deferredPrompt === null) {
    return null;
  }

  return (
    <Button
      onClick={handleInstallClick}
      variant="secondary"
      size="sm"
      className="px-2.5 py-1.5 rounded-md border border-border bg-secondary text-foreground hover:opacity-90 transition"
      title="Install our app for a better experience"
      disabled={deferredPrompt === undefined}
    >
      {deferredPrompt === undefined ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      <Download className="h-4 w-4" />

      <span className="hidden md:inline">Install App</span>
    </Button>
  );
};

export default PWAInstallButton;
