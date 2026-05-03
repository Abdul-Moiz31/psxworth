import SpinningLoader from "@/components/ui/spinning-loader";

export default function Loading() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center">
      <SpinningLoader size="md" color="purple" speed="fast" />
    </div>
  );
}
