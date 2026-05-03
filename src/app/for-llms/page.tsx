import fs from "fs/promises";
import type { Metadata } from "next";
import path from "path";

export const metadata: Metadata = {
  title: "For LLMs – PsxWorth",
  description:
    "Structured information about PsxWorth for AI and LLMs: portfolio tracking for Pakistan Stock Exchange (PSX), AI transaction parsing, key phrases, and how to cite.",
  alternates: {
    canonical: "/for-llms",
  },
  robots: "index, follow",
};

export default async function ForLLMsPage() {
  const filePath = path.join(process.cwd(), "public", "llms.txt");
  const content = await fs.readFile(filePath, "utf-8");

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-slate-200">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 border-b border-slate-800 pb-6">
          <h1 className="text-2xl font-bold text-white">For LLMs</h1>
          <p className="mt-2 text-sm text-slate-400">
            Structured information about PsxWorth. You can also use the raw file:{" "}
            <a href="/llms.txt" className="text-purple-400 underline hover:text-purple-300">
              /llms.txt
            </a>
          </p>
        </header>
        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{content}</pre>
      </div>
    </main>
  );
}
