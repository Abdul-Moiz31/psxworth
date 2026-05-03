"use client";

import { AnimateChangeInHeight } from "@/components/molecules/AnimateChangeInHeight";
import { AnnouncementBanner, PWAInstallAnnouncement } from "@/components/organisms/announcements";
import { PWA_INSTALL_ACCEPTED } from "@/utils/posthog/events";
import posthog from "posthog-js";
import { useEffect, useState } from "react";
import { toast } from "../molecules/Toast";

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

const BANNER_DISMISS_STORAGE_KEY = "pwa-banner-dismissed";
const DISMISS_DURATION_MS = 60 * 60 * 1000;
const FALLBACK_DECISION_DELAY_MS = 2000;

type BannerView = "loading" | "pwa" | "hidden";

const LoadingContent = () => (
  <div className="flex items-center justify-between py-2">
    <div className="flex items-center space-x-3 flex-1">
      <div className="flex-shrink-0">
        <div className="h-8 w-8 rounded-lg bg-white/10 animate-pulse" />
      </div>
      <div className="flex-1 space-y-2">
        <div className="h-3 w-3/4 rounded bg-white/10 animate-pulse" />
        <div className="hidden h-3 w-1/2 rounded bg-white/5 animate-pulse sm:block" />
      </div>
    </div>
    <div className="ml-4 flex items-center space-x-3">
      <div className="h-8 w-20 rounded bg-white/10 animate-pulse" />
      <div className="h-6 w-6 rounded-full bg-white/10 animate-pulse" />
    </div>
  </div>
);

const PWAInstallBanner = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [bannerView, setBannerView] = useState<BannerView>("loading");

  useEffect(() => {
    const wasRecentlyDismissed = () => {
      try {
        const dismissed = localStorage.getItem(BANNER_DISMISS_STORAGE_KEY);
        if (!dismissed) return false;

        const dismissedTime = Number.parseInt(dismissed, 10);
        return Number.isFinite(dismissedTime) && Date.now() - dismissedTime < DISMISS_DURATION_MS;
      } catch (error) {
        console.error("Error reading banner dismissal timestamp", error);
        return false;
      }
    };

    const isStandalone = () => {
      return window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true;
    };

    const recentlyDismissed = wasRecentlyDismissed();
    const standalone = isStandalone();

    if (recentlyDismissed || standalone) {
      setTimeout(() => setBannerView("hidden"), 0);
    }

    const handleBeforeInstallPrompt = (event: BeforeInstallPromptEvent) => {
      event.preventDefault();
      setDeferredPrompt(event);
      setBannerView("pwa");
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
    };

    if (!recentlyDismissed && !standalone) {
      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    }
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  useEffect(() => {
    if (bannerView !== "loading" || deferredPrompt) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setBannerView("hidden");
    }, FALLBACK_DECISION_DELAY_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [bannerView, deferredPrompt]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        setBannerView("hidden");
        posthog.capture(PWA_INSTALL_ACCEPTED);
      }

      setDeferredPrompt(null);
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

  const handleCloseBanner = () => {
    try {
      localStorage.setItem(BANNER_DISMISS_STORAGE_KEY, Date.now().toString());
    } catch (error) {
      console.error("Error writing banner dismissal timestamp", error);
    }

    setDeferredPrompt(null);
    setBannerView("hidden");
  };

  if (bannerView === "hidden") {
    return null;
  }

  return (
    <AnimateChangeInHeight>
      <AnnouncementBanner>
        {bannerView === "pwa" ? (
          <PWAInstallAnnouncement onInstall={handleInstallClick} onDismiss={handleCloseBanner} />
        ) : (
          <LoadingContent />
        )}
      </AnnouncementBanner>
    </AnimateChangeInHeight>
  );
};

export default PWAInstallBanner;
