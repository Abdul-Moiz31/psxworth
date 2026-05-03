import { PropsWithChildren } from "react";

export const AnnouncementBanner = ({ children }: PropsWithChildren) => (
  <div className="bg-card text-gray-100 shadow-lg relative z-50" aria-live="polite" role="status">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
  </div>
);
