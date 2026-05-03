"use client";

import { cn } from "@/lib/utils";
import * as motion from "motion/react-client";
import Image from "next/image";
import { useState } from "react";

const features = [
  {
    id: "ai-import",
    label: "AI Transaction Parsing",
    title: "Seamlessly import your portfolio from any source - very quickly.",
    description:
      "AI transaction parsing allows you to import your portfolio from any source very quickly. No other PSX tracker offers this.",
    image: "/home/AI-transaction-parsing.png",
    width: 1302,
    height: 870,
    highlight: "Only on PsxWorth",
  },
  {
    id: "upcoming-payouts",
    label: "Dividend & Payout Tracker",
    title: "PSX dividend, bonus, split, and right issue tracker",
    description:
      "Track all upcoming PSX corporate actions - dividends, bonus shares, stock splits, and right issues. Get book closure dates and payment schedules so you never miss an entitlement.",
    image: "/home/payouts.png",
    width: 1862,
    height: 624,
    highlight: "Stay Informed",
  },
  {
    id: "portfolio-analytics",
    label: "Portfolio Analytics",
    title: "Comprehensive portfolio analytics for PSX investors",
    description:
      "View sector allocation, stock weightage, realized vs unrealized gains, average cost per share, dividend yield, and total returns. Make data-driven investment decisions with PsxWorth.",
    image: "/home/portfolio-analytics.png",
    width: 1206,
    height: 452,
    highlight: "Comprehensive",
  },
  {
    id: "historical-returns",
    label: "Historical Returns",
    title: "Historical portfolio returns tracking for PSX investors",
    description:
      "Track your PSX portfolio performance over time with interactive charts. See daily, weekly, monthly, and yearly returns. Visualize your investment journey from the first transaction.",
    image: "/home/historical-returns.png",
    width: 1626,
    height: 952,
    highlight: "Performance",
  },
  {
    id: "etf-analysis",
    label: "ETF Holdings Analysis",
    title: "ETF holdings and underlying stock weightage for PSX ETFs",
    description:
      "PsxWorth shows you the underlying stock weightage of any PSX ETF in your portfolio. Understand your true exposure and avoid over-concentration in specific stocks or sectors.",
    image: "/home/etf-analysis.png",
    width: 1410,
    height: 1510,
    highlight: "Only on PsxWorth",
  },
];

export const FeatureShowcase = () => {
  const [activeFeature, setActiveFeature] = useState(features[0].id);
  const currentFeature = features.find((f) => f.id === activeFeature) || features[0];

  return (
    <section id="features" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <span className="text-sm font-medium uppercase tracking-wider text-purple-400">Features</span>
          <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl md:text-5xl">
            Features no other PSX portfolio tracker offers
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">
            AI transaction parsing, ETF holdings analysis, dividend tracking, and historical returns - built exclusively
            for Pakistan Stock Exchange investors
          </p>
        </motion.div>

        {/* Feature Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative mt-12"
        >
          <div className="mx-auto w-full max-w-5xl">
            <div className="relative flex flex-wrap justify-center gap-1 rounded-xl border border-white/10 bg-slate-900/80 p-1 backdrop-blur-sm">
              {features.map((feature) => (
                <button
                  key={feature.id}
                  onClick={() => setActiveFeature(feature.id)}
                  className={cn(
                    "relative z-10 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition-colors duration-200 sm:px-4 sm:py-2.5 sm:text-sm",
                    activeFeature === feature.id ? "text-white" : "text-slate-400 hover:text-slate-200"
                  )}
                >
                  {activeFeature === feature.id && (
                    <motion.div
                      layoutId="activeFeatureTab"
                      className="absolute inset-0 rounded-lg bg-purple-600 shadow-lg shadow-purple-600/25"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                    />
                  )}
                  <span className="relative z-10">{feature.label}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Feature Content */}
        <div className="mt-16 grid items-center gap-12 lg:grid-cols-2">
          {/* Text Content */}
          <motion.div
            key={currentFeature.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="order-2 lg:order-1"
          >
            {/* Feature highlight badge */}
            {currentFeature.highlight && (
              <span className="mb-4 inline-block rounded-full bg-purple-500/20 px-3 py-1 text-sm font-medium text-purple-300">
                {currentFeature.highlight}
              </span>
            )}
            <h3 className="text-2xl font-bold text-white sm:text-3xl md:text-4xl">{currentFeature.title}</h3>
            <p className="mt-4 text-lg text-slate-300">{currentFeature.description}</p>
            <div className="mt-8">
              <a
                href="/portfolio"
                className="inline-flex items-center gap-2 text-purple-400 transition-colors hover:text-purple-300"
              >
                Try it free
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          </motion.div>

          {/* Image */}
          <motion.div
            key={`${currentFeature.id}-image`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="order-1 lg:order-2"
          >
            <div className="relative overflow-hidden rounded-2xl border border-purple-400/20 bg-gradient-to-b from-slate-800/60 to-slate-900/80 p-2 ring-1 ring-white/10">
              <div className="absolute -inset-2 bg-gradient-to-r from-purple-500/35 via-cyan-500/25 to-blue-500/35 blur-2xl" />
              <div className="relative w-full overflow-hidden rounded-xl bg-slate-900">
                <Image
                  src={currentFeature.image}
                  alt={`${currentFeature.label} feature preview`}
                  width={currentFeature.width}
                  height={currentFeature.height}
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className={cn(
                    "h-auto object-contain transition-transform duration-300 hover:scale-[1.01]",
                    currentFeature.id === "etf-analysis" ? "mx-auto max-h-[560px] w-auto max-w-full" : "w-full"
                  )}
                  priority={currentFeature.id === "ai-import"}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
