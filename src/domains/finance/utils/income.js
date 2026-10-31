export const getIncomeYears = (incomeSources) => {
  if (!incomeSources || incomeSources.length === 0) {
    return [];
  }

  const years = incomeSources.map((source) => source.year);
  return [...new Set(years)].sort((a, b) => a - b);
};

export const getSourcesForYear = (incomeSources, year) =>
  (incomeSources || [])
    .filter((source) => source.year === year)
    .sort((a, b) => b.amount - a.amount);

export const getYearTotal = (incomeSources, year) =>
  getSourcesForYear(incomeSources, year).reduce(
    (sum, source) => sum + source.amount,
    0,
  );

export const getIncomeYoY = (incomeSources, year) => {
  const currentTotal = getYearTotal(incomeSources, year);
  const prevTotal = getYearTotal(incomeSources, year - 1);
  const change = currentTotal - prevTotal;
  const changePercent = prevTotal !== 0 ? (change / prevTotal) * 100 : 0;

  return { currentTotal, prevTotal, change, changePercent };
};
