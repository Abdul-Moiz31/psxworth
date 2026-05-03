import { HeroDashboardPreview } from "@/components/home/NewHeroSection/HeroDashboardPreview";
import type { Metadata } from "next";
import * as motion from "motion/react-client";
import { ActionButtons } from "./components/ActionButtons";

export const metadata: Metadata = {
  alternates: {
    canonical: "/welcome",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function WelcomePage() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-20 sm:px-6 md:pb-24 md:pt-28 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-6 flex justify-center"
        >
          <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-4 py-1.5 text-xs font-medium text-emerald-300 sm:text-sm">
            Welcome to PsxWorth
          </span>
        </motion.div>

        <div className="mx-auto max-w-4xl text-center">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.15 }}
            className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
          >
            Create your first&nbsp;
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              PSX portfolio
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-center text-lg text-slate-300 md:text-xl"
          >
            Your account is ready. Create your portfolio and start tracking in minutes.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.35 }}
          className="mt-10 flex justify-center"
        >
          <ActionButtons />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.4 }}
          className="mx-auto mt-12 max-w-3xl text-center"
        >
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">Need help getting started?</h2>
          <p className="mt-2 text-slate-300">Watch this quick walkthrough before creating your first portfolio.</p>
        </motion.div>

        <HeroDashboardPreview />
      </div>
    </section>
  );
}
