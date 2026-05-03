import { Download, Smartphone, X } from "lucide-react";

type PWAInstallAnnouncementProps = {
  onInstall: () => void;
  onDismiss: () => void;
};

export const PWAInstallAnnouncement = ({ onInstall, onDismiss }: PWAInstallAnnouncementProps) => (
  <div className="flex items-center justify-between py-2">
    <div className="flex items-center space-x-3 flex-1">
      <div className="flex-shrink-0">
        <div className="bg-white/20 rounded-lg p-1.5">
          <Smartphone className="h-4 w-4" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium sm:text-base">Install our app for a better experience</p>
      </div>
    </div>

    <div className="flex items-center space-x-3 ml-4">
      <button
        onClick={onInstall}
        className="bg-white/90 hover:bg-white text-gray-900 font-medium py-1.5 px-3 rounded-md text-sm transition-all duration-200 hover:scale-105 flex items-center space-x-2"
      >
        <Download className="h-4 w-4" />
        <span>Install</span>
      </button>

      <button
        onClick={onDismiss}
        className="text-gray-100/80 hover:text-gray-100 hover:bg-white/10 rounded-md p-1 transition-colors duration-200"
        aria-label="Close banner"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  </div>
);
