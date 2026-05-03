import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function Blocked() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold">Access blocked. </h1>
      <h3 className="text-2xl font-bold">You have been rate limited. Please try again after some time</h3>
      <p className="text-lg">Please try again later.</p>
    </div>
  );
}
