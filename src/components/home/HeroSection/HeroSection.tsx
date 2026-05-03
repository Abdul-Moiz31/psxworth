import { HeroText } from "./components/HeroText";
import { StockDashboard } from "./components/StockDashboard";

export const HeroSection = () => {
  return (
    <section
      id="hero"
      aria-labelledby="hero-title"
      aria-describedby="hero-description"
      className="mx-auto max-w-7xl overflow-hidden px-3 py-12 sm:px-6 md:px-12 md:py-24"
    >
      <div className="grid items-center gap-12 md:grid-cols-2">
        <HeroText />
        <StockDashboard />
      </div>
    </section>
  );
};
