import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  alternates: {
    canonical: "/faqs",
  },
};

export default function FAQPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.trigger,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.content,
      },
    })),
  };

  return (
    <div className="flex justify-center py-12 border-4 overflow-auto w-full ">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="w-full max-w-2xl px-4">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-200">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-400">
            Find answers to common questions about our services and features.
          </p>
        </div>

        {/* FAQ items */}
        <Accordion type="single" collapsible className="w-full">
          {faqItems.map((item, index) => (
            <AccordionItem value={`item-${index}`} key={index}>
              <AccordionTrigger className="font-semibold text-lg text-gray-200">
                {item.trigger}
              </AccordionTrigger>
              <AccordionContent className="text-lg text-gray-300">
                {item.content}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Additional Info */}
        <div className="text-center mt-12">
          <p className="text-gray-300">
            Couldn&apos;t find what you were looking for?
            <a
              href={"/contact"}
              className="text-purple-400 hover:text-purple-300 cursor-pointer ml-1 font-medium transition-colors duration-300"
            >
              Contact Us
            </a>{" "}
            for further assistance. We are here to help you with any inquiries.
          </p>
        </div>
      </div>
    </div>
  );
}

const faqItems = [
  {
    trigger: "Is PsxWorth free to use?",
    content:
      "Yes, PsxWorth is completely free to use for now. We believe in providing our users with the best tools for tracking their investments. To improve quality of our services a paid plan maybe introduced in the future.",
  },
  {
    trigger: "How often are stock prices updated?",
    content:
      "Stock prices are updated every 5 minutes during market hours (9:30 AM - 4:00 PM ET). ",
  },
  {
    trigger: "Can I track multiple portfolios?",
    content:
      "Yes! You can create and manage multiple portfolios to organize your investments. Each portfolio tracks performance independently. This is perfect for separating different investment strategies or investing for family members.",
  },
];
