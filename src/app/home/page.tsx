import type { Metadata } from "next";
import { FAQSection } from "@/components/home/FAQSection/FAQSection";
import { FeatureShowcase } from "@/components/home/FeatureShowcase/FeatureShowcase";
import { FinalCTA } from "@/components/home/FinalCTA/FinalCTA";
import { HighlightsSection } from "@/components/home/HighlightsSection/HighlightsSection";
import { HowItWorks } from "@/components/home/HowItWorks/HowItWorks";
import { NewHeroSection } from "@/components/home/NewHeroSection/NewHeroSection";

export const metadata: Metadata = {
  alternates: {
    canonical: "/home",
  },
};

export default function Home() {
  return (
    <>
      <NewHeroSection />
      <FeatureShowcase />
      <HighlightsSection />
      <HowItWorks />
      <FAQSection />
      <FinalCTA />
    </>
  );
}
