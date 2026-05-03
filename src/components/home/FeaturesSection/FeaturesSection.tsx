import {
  staggerChildren,
  featureVariants,
  pendulum,
  bounce,
  pulse,
  breathe,
} from "@/utils/constants/animationVariants";
import * as motion from "motion/react-client";
import { FeatureCard } from "./components/FeatureCard";

export const FeaturesSection = () => {
  return (
    <section id="features" className="mx-auto max-w-7xl px-3 py-16 sm:px-6 md:px-12 md:py-24">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerChildren}
        className="mb-16 text-center"
      >
        <motion.h3 variants={featureVariants} className="mb-2 text-sm uppercase tracking-widest text-blue-400">
          Features
        </motion.h3>
        <motion.h2 variants={featureVariants} className="mb-3 text-3xl font-bold md:text-4xl">
          Track Every Transaction. Free with No Ads
        </motion.h2>
        <motion.p variants={featureVariants} className="mx-auto max-w-3xl text-slate-300">
          From buys and sells to dividends, PsxWorth provides insightful metrics for a clear picture of your portfolio
          performance.
        </motion.p>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerChildren}
        className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 items-stretch"
      >
        {/* Feature Card 1 */}

        <FeatureCard
          title="Free Portfolio Tracker - No Ads"
          description="Focus on your returns, not distractions. PsxWorth is free and has zero ads."
          icon={
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          }
          gradient="from-blue-500 to-indigo-600"
          iconAnimation={pendulum()}
        />

        {/* Feature Card 2 - Import Multiple Transactions */}
        <FeatureCard
          title="Import Multiple Transactions"
          description="Add your entire trade history in seconds for complete performance insights."
          icon={
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 10.5l4.5 4.5 4.5-4.5M12 3v12"
            />
          }
          gradient="from-emerald-500 to-teal-600"
          iconAnimation={breathe}
        />

        {/* Feature Card 3 - Portfolio Allocation */}
        <FeatureCard
          title="Allocation by Stocks & Sectors"
          description="See exactly where your money is allocated to stay balanced and diversified."
          icon={
            <>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.5 6a7.5 7.5 0 107.5 7.5H10.5V6z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 3.75v6.75h6.75" />
            </>
          }
          gradient="from-amber-500 to-orange-600"
          iconAnimation={pulse}
        />

        {/* Feature Card 4 - Investment Metrics */}
        <FeatureCard
          title="Investment Metrics"
          description="Track realized profit, unrealized profit, inflation-adjusted gains, and average cost per unit."
          icon={
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          }
          gradient="from-purple-500 to-pink-600"
          iconAnimation={bounce}
        />

        {/* Feature Card 5 - Install Anywhere */}
        <FeatureCard
          title="Install Anywhere"
          description="Access your portfolio from any device (Desktop, Android or IOS), anywhere, with our responsive web app."
          icon={
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          }
          gradient="from-cyan-500 to-blue-600"
          iconAnimation={pulse}
        />
      </motion.div>
    </section>
  );
};
