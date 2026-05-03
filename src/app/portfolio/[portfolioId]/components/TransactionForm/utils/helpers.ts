export const calculateNetDividend = (
  shares?: number,
  dividendPerShare?: number,
  commissionAndTaxes?: number,
  isCommissionPercentage?: boolean
): number | null => {
  if (!shares || !dividendPerShare) {
    return null;
  }

  const grossDividend = shares * dividendPerShare;
  let commission = commissionAndTaxes || 0;

  if (isCommissionPercentage && commission) {
    commission = (grossDividend * commission) / 100;
  }

  return grossDividend - commission;
};
