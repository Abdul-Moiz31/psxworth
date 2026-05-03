"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";
import { ReturnType } from "../shared/types";

interface ReturnTypeTooltipProps {
  returnType: ReturnType;
  className?: string;
}

const returnTypeDetails: Record<
  ReturnType,
  {
    methodLabel: string;
    title: string;
    subtitle: string;
    questionItAnswers: string;
    useWhen: string;
    formulaSummary: string;
    whyNumbersDiffer: string;
    example: string;
  }
> = {
  simple: {
    methodLabel: "Simple Return",
    title: "Simple Return",
    subtitle: "The easiest gain/loss view.",
    questionItAnswers: "How much am I up or down compared to the money I have put in during this selected period?",
    useWhen: "Use this for a quick, intuitive health check of your portfolio.",
    formulaSummary:
      "We compare your current value against invested capital in this range (opening value at start + buys, adjusted for withdrawals).",
    whyNumbersDiffer:
      "If you added a lot of money during the range, Simple Return can move differently from TWR and MWR because it directly uses invested amount.",
    example:
      "Start: 50,000. New buy: 10,000. End value: 72,000. Invested: 60,000. Gain: 12,000. Simple Return: 20%.",
  },
  twr: {
    methodLabel: "TWR",
    title: "Time-Weighted Return (TWR)",
    subtitle: "Performance of investments, not timing of cash deposits.",
    questionItAnswers: "How well did the investments perform, ignoring when I added or withdrew money?",
    useWhen: "Use this when you want a fair performance comparison across time, portfolios, or benchmarks.",
    formulaSummary:
      "We split the timeline at each cash-flow date, calculate each segment return, then chain them together.",
    whyNumbersDiffer:
      "TWR intentionally removes deposit timing impact. So even big deposits may not change TWR much if underlying performance is unchanged.",
    example:
      "Portfolio +10%, then you add cash, then +5%. TWR is (1.10 × 1.05 - 1) = 15.5%, independent of how much cash you added.",
  },
  mwr: {
    methodLabel: "MWR",
    title: "Money-Weighted Return (MWR)",
    subtitle: "Your personal result after considering timing of deposits/withdrawals.",
    questionItAnswers: "Did my own timing help or hurt my result?",
    useWhen: "Use this to evaluate your personal investing experience, not just strategy performance.",
    formulaSummary:
      "We use your actual cash movements and dates and compute one rate that best fits those real flows (IRR-style).",
    whyNumbersDiffer:
      "MWR is very sensitive to timing. Large deposits before a rally can push MWR up; before a drop can push it down.",
    example:
      "Two users hold the same stock, but one invests before a rise and the other after it. Their MWR can be very different.",
  },
};

export function ReturnTypeTooltip({ returnType, className }: ReturnTypeTooltipProps) {
  const details = returnTypeDetails[returnType];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn("h-8 px-2 text-gray-200 hover:bg-slate-700 hover:text-white", className)}
        >
          <Info className="h-4 w-4" />
          <span className="ml-1.5 text-xs">How this return works</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[560px] bg-slate-900 border-slate-700 text-gray-100">
        <DialogHeader className="border-b border-slate-800 bg-slate-900/80 px-6 py-5">
          <span className="inline-flex w-fit rounded-full border border-slate-600 bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-300">
            {details.methodLabel}
          </span>
          <DialogTitle className="mt-2 text-2xl font-semibold text-gray-100">{details.title}</DialogTitle>
          <DialogDescription className="text-gray-300">{details.subtitle}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-6 pb-6">
          <section className="rounded-lg border border-slate-700 bg-slate-800/60 p-3">
            <h4 className="text-sm font-semibold text-gray-100">What question this answers</h4>
            <p className="mt-1 text-sm text-gray-300">{details.questionItAnswers}</p>
          </section>

          <section className="rounded-lg border border-slate-700 bg-slate-800/60 p-3">
            <h4 className="text-sm font-semibold text-gray-100">When to use this</h4>
            <p className="mt-1 text-sm text-gray-300">{details.useWhen}</p>
          </section>

          <section className="rounded-lg border border-slate-700 bg-slate-800/60 p-3">
            <h4 className="text-sm font-semibold text-gray-100">How we calculate it</h4>
            <p className="mt-1 text-sm text-gray-300">{details.formulaSummary}</p>
            <p className="mt-2 text-sm text-gray-400">
              <span className="font-medium text-gray-300">Why this may not match other return types:</span>{" "}
              {details.whyNumbersDiffer}
            </p>
          </section>

          <section className="rounded-lg border border-slate-700 bg-slate-800/60 p-3">
            <h4 className="text-sm font-semibold text-gray-100">Quick example</h4>
            <p className="mt-1 text-sm text-gray-300">{details.example}</p>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
