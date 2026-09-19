export const getYears = (netWorthHistory) => {
  if (!netWorthHistory || netWorthHistory.length === 0) {
    return [];
  }

  const years = netWorthHistory.map((entry) => {
    const year = parseInt((entry?.date || "").split("-")[0]);
    return year;
  });

  return [...new Set(years)].sort((a, b) => a - b);
};

export const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const getMonthlyChartData = (netWorthHistory, year) => {
  if (!netWorthHistory || netWorthHistory.length === 0) {
    return [];
  }

  return netWorthHistory
    .filter((entry) => parseInt((entry?.date || "").split("-")[0]) === year)
    .map((entry) => {
      const monthIndex = parseInt((entry?.date || "").split("-")[1]) - 1;
      return {
        month: MONTH_LABELS[monthIndex],
        netWorth: entry.netWorth,
      };
    });
};

export const getEntryAssets = (entry) => {
  let totalAssets = 0;
  (entry?.accounts || []).forEach((account) => {
    if (account.category === "ASSET") {
      totalAssets += account.balance || 0;
    }
  });
  return totalAssets;
};

export const getEntryLiabilities = (entry) => {
  let totalLiabilities = 0;
  (entry?.accounts || []).forEach((account) => {
    if (account.category === "LIABILITY") {
      totalLiabilities += account.balance || 0;
    }
  });
  return totalLiabilities;
};

export const getYearMetrics = (netWorthHistory, selectedYear) => {
  if (!netWorthHistory || !selectedYear) {
    return {
      currentNetWorth: 0,
      prevYearNetWorth: 0,
      yoyChange: 0,
      yoyPercentage: 0,
      currentAssets: 0,
      currentLiabilities: 0,
    };
  }

  // Get the last entry for the selected year
  const yearEntries = Object.values(netWorthHistory).filter(
    (entry) => parseInt((entry?.date || "").split("-")[0]) === selectedYear,
  );
  const lastYearEntry = yearEntries[yearEntries.length - 1];

  // Get the last entry from previous year for YoY comparison
  const prevYearEntries = Object.values(netWorthHistory).filter(
    (entry) => parseInt((entry?.date || "").split("-")[0]) === selectedYear - 1,
  );
  const lastPrevYearEntry = prevYearEntries[prevYearEntries.length - 1];

  const currentNetWorth = lastYearEntry?.netWorth || 0;
  const prevYearNetWorth = lastPrevYearEntry?.netWorth || 0;
  const yoyChange = currentNetWorth - prevYearNetWorth;
  const yoyPercentage =
    prevYearNetWorth !== 0 ? (yoyChange / prevYearNetWorth) * 100 : 0;

  // Calculate current year assets and liabilities
  const currentAssets = getEntryAssets(lastYearEntry);
  const currentLiabilities = getEntryLiabilities(lastYearEntry);

  return {
    currentNetWorth,
    prevYearNetWorth,
    yoyChange,
    yoyPercentage,
    currentAssets,
    currentLiabilities,
  };
};
