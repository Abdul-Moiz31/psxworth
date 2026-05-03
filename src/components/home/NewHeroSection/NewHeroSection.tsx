import { Button } from "@/components/ui/button";
import { HeroDashboardPreview } from "./HeroDashboardPreview";

export function NewHeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6 md:pb-24 md:pt-32 lg:px-8">
        {/* Main Heading */}
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
            The Smartest way to track your&nbsp;
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              PSX Portfolio
            </span>
          </h1>
        </div>

        {/* Description */}
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg text-slate-300 md:text-xl">
          Portfolio performance, sector weightage, and historical returns and AI transaction parsing from any broker or
          CDC statement. The most capable PSX portfolio tracker.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button asChild size="lg" className="h-12 px-8 text-base font-medium">
            <a href="/portfolio">Start Tracking Free</a>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base font-medium">
            <a href="#features">See Features</a>
          </Button>
        </div>

        {/* Hero dashboard / video preview - client component for scroll animation */}
        <HeroDashboardPreview />
      </div>
    </section>
  );
}
