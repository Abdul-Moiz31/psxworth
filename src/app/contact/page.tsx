import { Mail } from "lucide-react";
import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-900">
      <div className="relative">
        {/* Header Section */}
        <div className="text-center pt-12 pb-12 px-4">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-100 mb-6">Contact Us</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Track your portfolio performance with ease. Need help or have questions about your investment tracking?
          </p>
        </div>

        <div className="max-w-6xl mx-auto px-4 pb-20">
          {/* Contact Card */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700">
              <div className="text-center mb-6">
                <div className="inline-flex p-4 bg-purple-600 rounded-full mb-4">
                  <Mail className="w-8 h-8 text-gray-100" />
                </div>
                <h2 className="text-3xl font-bold text-gray-100 mb-1">Get in Touch</h2>
                <p className="text-gray-400 text-lg">We&apos;re here to help!</p>
              </div>

              <div className="space-y-4">
                {/* Email Contact */}
                <div className="flex flex-col md:flex-row items-center gap-6 p-6 rounded-2xl bg-slate-900 border border-slate-700 hover:border-purple-500 transition-colors duration-300">
                  <div className="text-center flex-grow">
                    <h3 className="text-xl font-semibold text-gray-100 mb-1">Email Support</h3>
                    <p className="text-gray-400 mb-3">Send us your questions and we&apos;ll get back to you soon.</p>
                    <a
                      href="mailto:support@psxworth.com"
                      className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 font-medium transition-colors duration-300 text-lg"
                    >
                      support@psxworth.com
                    </a>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="mt-6 p-6 bg-slate-900 rounded-2xl border border-slate-700 hover:border-purple-500 transition-colors duration-300">
                <div className="text-center">
                  <h4 className="text-lg font-semibold text-gray-100 mb-3">Response Time</h4>
                  <p className="text-gray-400">
                    We typically respond to all inquiries within 24 hours during business days. For urgent technical
                    issues, please include &quot;URGENT&quot; in your email subject line.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Hint */}
          <div className="text-center mt-12">
            <p className="text-gray-300">
              Looking for quick answers? Check out our
              <a
                href={"/faqs"}
                className="text-purple-400 hover:text-purple-300 cursor-pointer ml-1 font-medium transition-colors duration-300"
              >
                FAQ section
              </a>{" "}
              for common questions about portfolio tracking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
