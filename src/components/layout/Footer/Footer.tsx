"use client";

import { usePathname } from "next/navigation";
import Spacer from "../../ui/Spacer";
import SocialLinks from "../../molecules/SocialLinks";

export const Footer = () => {
  const pathname = usePathname();
  if (pathname.includes("portfolio")) {
    return <Spacer size={36} />;
  }

  return (
    <footer className="py-8 md:py-12 px-3 md:px-10 border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
              PsxWorth
            </h3>
            <p className="text-slate-400">
              Track every transaction. Monitor your gains. Make informed
              decisions.
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center">
          <p className="text-slate-400 text-sm">
            © 2025 PsxWorth. All rights reserved.
          </p>
          <SocialLinks />
        </div>
      </div>
      <Spacer size={36} className="md:hidden" />{" "}
      {/**On mobile we show navigation bar at bottom */}
    </footer>
  );
};
