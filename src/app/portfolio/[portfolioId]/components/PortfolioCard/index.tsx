import PortfolioItemActions from "@/components/molecules/PortfolioItemActions/PortfolioItemActions";
import { Portfolio } from "@/db/schema";
import { twMerge } from "tailwind-merge";

interface PortfolioCardProps {
  portfolio: Portfolio;
  className?: string;
}
export const PortfolioCard = (props: PortfolioCardProps) => {
  const { portfolio, className } = props;
  return (
    <div className={twMerge("flex w-full items-center justify-start gap-2 p-1", className)}>
      <div
        className={"flex h-10 w-10 items-center justify-center rounded-full shrink-0"}
        style={{ backgroundColor: portfolio.backgroundColor }}
      >
        <span className="text-md">{portfolio.emoji}</span>
      </div>
      <h2 className="text-lg md:text-sm font-bold text-left flex-1 tracking-tight">{portfolio.title}</h2>
      <PortfolioItemActions portfolio={portfolio} className="ml-auto" />
    </div>
  );
};

export default PortfolioCard;
