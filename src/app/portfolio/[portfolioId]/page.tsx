import { getPortfolios } from "@/actions/portfolio/portfolioActions";
import { getDetailedPortfolioPerformance } from "@/actions/portfolioPerformance/portfolioPerformance";
import { Portfolio } from "@/db/schema";
import CommunityPromptHandler from "@/components/organisms/CommunityJoinPrompt/CommunityPromptHandler";
import { Button } from "@/components/ui/button";
import { Metadata } from "next";
import { PortfolioCookieSetter } from "./components/PortfolioCookieSetter";
import { PortfolioPageTabs } from "./components/PortfolioPageTabs";

export const dynamic = "force-dynamic"; // This page will always be re-rendered on the server

type MetadataProps = {
  params: Promise<{ portfolioId: string }>;
};

export async function generateMetadata({ params }: MetadataProps): Promise<Metadata> {
  const { portfolioId } = await params;
  return {
    alternates: {
      canonical: `/portfolio/${portfolioId}`,
    },
  };
}

type PortfolioPageProps = {
  params: Promise<{ portfolioId: string }>;
};

export default async function PortfolioPage({ params }: PortfolioPageProps) {
  const { portfolioId: portfolioIdString } = await params;
  const portfolioId = Number(portfolioIdString);

  if (Number.isNaN(portfolioId)) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-4 text-center">
        <h2 className="mb-4 text-2xl font-bold text-red-500">Invalid Portfolio</h2>
        <p className="text-lg text-gray-200">The provided portfolio ID is invalid.</p>
        <Button asChild>
          <a href="/portfolio">Click here to try again</a>
        </Button>
        <PortfolioCookieSetter shouldDelete={true} />
      </div>
    );
  }

  const [performanceResponse, portfoliosListResponse] = await Promise.all([
    getDetailedPortfolioPerformance(portfolioId),
    getPortfolios(),
  ]);

  //First handle performance response
  if (!performanceResponse.success) {
    const errorMessage =
      performanceResponse.status >= 500
        ? "We're experiencing a temporary issue connecting to your portfolio. Please try again shortly."
        : performanceResponse.message;

    return (
      <div className="flex h-full flex-col items-center justify-center p-4 text-center">
        <h2 className="mb-4 text-2xl font-bold text-red-500">Something Went Wrong</h2>
        <p className="text-lg text-gray-200">{errorMessage}</p>
        <Button asChild>
          <a href="/portfolio">Click here to try again</a>
        </Button>
        <PortfolioCookieSetter shouldDelete={true} />
      </div>
    );
  }

  if (!portfoliosListResponse.success) {
    const errorMessage =
      portfoliosListResponse.status >= 500
        ? "We're experiencing a temporary issue connecting to your portfolio list. Please try again shortly."
        : portfoliosListResponse.message;

    return (
      <div className="flex h-full flex-col items-center justify-center p-4 text-center">
        <h2 className="mb-4 text-2xl font-bold text-red-500">Something Went Wrong</h2>
        <p className="text-lg text-gray-200">{errorMessage}</p>
        <Button asChild>
          <a href="/portfolio">Click here to try again</a>
        </Button>
        <PortfolioCookieSetter shouldDelete={true} />
      </div>
    );
  }

  const portfoliosList = portfoliosListResponse.data;
  if (!portfoliosList) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-4 text-center">
        <h2 className="mb-4 text-2xl font-bold text-red-500">Something Went Wrong</h2>
        <p className="text-lg text-gray-200">Unable to load portfolios</p>
        <Button asChild>
          <a href="/portfolio">Click here to try again</a>
        </Button>
        <PortfolioCookieSetter shouldDelete={true} />
      </div>
    );
  }
  const portfolioInfo = (portfoliosList as Portfolio[]).find((portfolio) => portfolio.id === portfolioId);

  if (!portfolioInfo) {
    return (
      <div>
        <PortfolioCookieSetter shouldDelete={true} />
        <h2 className="mb-4 text-2xl font-bold text-red-500">Something Went Wrong</h2>
        <p className="text-lg text-gray-200">Unable to load portfolio</p>

        <Button asChild>
          <a href="/portfolio">Click here to try again</a>
        </Button>
      </div>
    );
  }

  return (
    <main className="mx-auto flex h-full min-h-0 flex-col px-0 pt-0 pb-0">
      <PortfolioCookieSetter portfolioId={portfolioId} />
      <PortfolioPageTabs portfolioPerformance={performanceResponse.data} portfolioId={portfolioId} />
      <CommunityPromptHandler />
    </main>
  );
}
