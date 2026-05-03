import { getPortfolios } from "@/actions/portfolio/portfolioActions";
import { notFound, redirect } from "next/navigation";

async function redirectToFirstPortfolio() {
  const response = await getPortfolios();

  if (response?.success && typeof response.data === "object" && response.data[0]) {
    redirect(`/portfolio/${response.data[0].id}`);
  } else if (!response?.success) {
    notFound();
  }

  redirect("/welcome");
}

/**
 * Keep this page as a redirect to the first portfolio.
 * Middleware handles lastActivePortfolio cookie redirects.
 */
export default async function PortfolioPage() {
  await redirectToFirstPortfolio();
  return null; // This should never render
}
