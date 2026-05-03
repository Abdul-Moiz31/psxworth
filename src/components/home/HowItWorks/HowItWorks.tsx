import * as motion from "motion/react-client";
import { HowItWorksDemoPreview } from "./HowItWorksDemoPreview";

const steps = [
  {
    number: "01",
    title: "Create your portfolio",
    description:
      "Sign up in seconds - no credit card needed. Create multiple portfolios for different investment strategies or family members.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Import with AI - from any source",
    description: "Seamlessly import your portfolio from any source very quickly. No other PSX tracker offers this.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"
        />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Track performance, weightage & returns",
    description:
      "See portfolio performance, sector weightage, and historical returns. Real-time prices, upcoming payouts, and ETF analysis - all in one place.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
        />
      </svg>
    ),
  },
];

export const HowItWorks = () => {
  return (
    <section className="relative py-24 md:py-32">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <span className="text-sm font-medium uppercase tracking-wider text-purple-400">How it works</span>
          <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl md:text-5xl">
            Start tracking your PSX portfolio in minutes
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">
            Three simple steps to use the best PSX portfolio tracker
          </p>
        </motion.div>

        {/* Steps */}
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="absolute left-1/2 top-12 hidden h-0.5 w-full bg-gradient-to-r from-purple-500/50 to-transparent md:block" />
              )}

              <div className="relative rounded-2xl border border-white/10 bg-slate-900/50 p-8 backdrop-blur-sm">
                {/* Step number */}
                <div className="absolute -top-4 left-8 rounded-full bg-purple-500 px-3 py-1 text-sm font-bold text-white">
                  {step.number}
                </div>

                {/* Icon */}
                <div className="mb-6 mt-2 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                  {step.icon}
                </div>

                {/* Content */}
                <h3 className="mb-3 text-xl font-bold text-white">{step.title}</h3>
                <p className="text-slate-400">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Image/Demo Section */}
        <HowItWorksDemoPreview />
      </div>
    </section>
  );
};
