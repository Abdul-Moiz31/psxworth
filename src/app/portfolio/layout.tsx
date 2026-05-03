import { getPortfolios } from "@/actions/portfolio/portfolioActions";
import { Portfolio } from "@/db/schema";
import PortfoliosSidebar from "./[portfolioId]/components/PortfoliosSidebar";

export default async function PortfolioLayout({ children }: { children: React.ReactNode }) {
  const response = await getPortfolios();
  const portfolioList = response?.success ? (response.data as Portfolio[]) : [];

  return <PortfoliosSidebar portfolioList={portfolioList}>{children}</PortfoliosSidebar>;
}
