"use client";

import { cn } from "@/lib/utils";
import * as motion from "motion/react-client";
import { useState } from "react";

const faqs = [
  {
    question: "What is the best portfolio tracking app for PSX?",
    answer:
      "PsxWorth is an AI-powered portfolio tracking platform built for Pakistan Stock Exchange (PSX) investors. Track portfolio performance, sector weightage, and historical returns - plus AI transaction parsing for broker and CDC statements, dividend and bonus tracking, and ETF holdings analysis. No other PSX tracker offers this combination.",
  },
  {
    question: "How does PsxWorth's AI transaction parser work?",
    answer:
      "AI transaction parsing lets you seamlessly import your portfolio from any source very quickly. No other PSX tracker offers this.",
  },
  {
    question: "Can I track PSX dividends and bonus shares?",
    answer:
      "Yes. PsxWorth is a comprehensive PSX dividend, bonus, split, and right issue tracker. It tracks all upcoming corporate actions for your holdings with book closure dates and payment schedules, so you never miss an entitlement.",
  },
  {
    question: "Does PsxWorth support ETF analysis?",
    answer:
      "Yes. PsxWorth provides ETF holdings and underlying stock weightage for PSX ETFs. When you add an ETF to your portfolio, you can see exactly which stocks are inside and their weightage, helping you understand your true exposure.",
  },
  {
    question: "How do I track historical returns on PsxWorth?",
    answer:
      "PsxWorth offers historical portfolio returns tracking for PSX investors. View your performance over time with interactive charts showing daily, weekly, monthly, and yearly returns. Track your investment journey from your first transaction.",
  },
  {
    question: "What portfolio analytics does PsxWorth provide?",
    answer:
      "PsxWorth provides comprehensive portfolio analytics for PSX investors: sector allocation, individual stock weightage, realized vs unrealized gains, average cost per share, dividend yield, and total returns - everything you need for data-driven investment decisions.",
  },
  {
    question: "Which PSX stocks and ETFs are supported?",
    answer:
      "PsxWorth supports all stocks and ETFs listed on the Pakistan Stock Exchange (PSX). Prices are updated in real-time during market hours. Import your portfolio from any source with AI transaction parsing - no other PSX tracker offers this.",
  },
  {
    question: "Is PsxWorth free to use?",
    answer:
      "Yes! During early access, PsxWorth is completely free with full access to all features including the AI transaction parser, dividend tracking, ETF analysis, and historical returns. No credit card required.",
  },
];

export const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="relative py-24 md:py-32">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent" />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <span className="text-sm font-medium uppercase tracking-wider text-purple-400">FAQ</span>
          <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl md:text-5xl">Frequently asked questions</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">Everything you need to know about PsxWorth</p>
        </motion.div>

        {/* FAQ List */}
        <div className="mt-12 space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className={cn(
                  "w-full rounded-xl border border-white/10 bg-slate-900/50 p-6 text-left backdrop-blur-sm transition-all duration-300",
                  openIndex === index
                    ? "border-purple-500/30 bg-slate-800/50"
                    : "hover:border-white/20 hover:bg-slate-800/30"
                )}
              >
                <div className="flex items-center justify-between">
                  <h3 className="pr-8 text-lg font-medium text-white">{faq.question}</h3>
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-500/10 text-purple-400 transition-transform duration-300",
                      openIndex === index && "rotate-180"
                    )}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <motion.div
                  initial={false}
                  animate={{
                    height: openIndex === index ? "auto" : 0,
                    opacity: openIndex === index ? 1 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <p className="mt-4 text-slate-400">{faq.answer}</p>
                </motion.div>
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
