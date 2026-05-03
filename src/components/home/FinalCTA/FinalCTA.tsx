import { Button } from "@/components/ui/button";
import * as motion from "motion/react-client";

export const FinalCTA = () => {
  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-purple-900/30 via-slate-900 to-blue-900/30 p-8 md:p-16"
        >
          {/* Background decorations */}
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative text-center">
            {/* Heading */}
            <h2 className="text-3xl font-bold text-white sm:text-4xl md:text-5xl">Start tracking your PSX portfolio</h2>

            {/* Description */}
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300">
              PsxWorth helps you track portfolio performance, sector weightage, and historical returns - built for
              Pakistan Stock Exchange (PSX) investors.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="h-12 px-8 text-base font-medium">
                <a href="/portfolio">Get Started Free</a>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base font-medium">
                <a href="/contact">Contact Us</a>
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Full access included</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>No ads</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
