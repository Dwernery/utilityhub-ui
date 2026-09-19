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
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
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

  return {
    currentNetWorth,
    prevYearNetWorth,
    yoyChange,
    yoyPercentage,
  };
};

export const getYearStats = (netWorthHistory, selectedYear) => {
  const empty = {
    bestMonth: null,
    worstMonth: null,
    avgChange: 0,
    avgChangePercent: 0,
    highest: 0,
    lowest: 0,
  };
  if (!netWorthHistory || !selectedYear) {
    return empty;
  }

  const entries = Object.values(netWorthHistory)
    .filter(
      (entry) => parseInt((entry?.date || "").split("-")[0]) === selectedYear,
    )
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  if (entries.length === 0) {
    return empty;
  }

  // Skip the first entry since it has no prior month to diff against
  const monthlyChanges = entries.slice(1).map((entry, idx) => {
    const monthIndex = parseInt((entry.date || "").split("-")[1]) - 1;
    const prevNetWorth = entries[idx].netWorth || 0;
    const change = (entry.netWorth || 0) - prevNetWorth;
    return {
      month: MONTH_LABELS[monthIndex],
      change,
      changePercent: prevNetWorth !== 0 ? (change / prevNetWorth) * 100 : 0,
    };
  });

  const bestMonth = monthlyChanges.length
    ? monthlyChanges.reduce((a, b) => (b.change > a.change ? b : a))
    : null;
  const worstMonth = monthlyChanges.length
    ? monthlyChanges.reduce((a, b) => (b.change < a.change ? b : a))
    : null;
  const avgChange = monthlyChanges.length
    ? monthlyChanges.reduce((sum, m) => sum + m.change, 0) /
      monthlyChanges.length
    : 0;
  const avgChangePercent = monthlyChanges.length
    ? monthlyChanges.reduce((sum, m) => sum + m.changePercent, 0) /
      monthlyChanges.length
    : 0;

  const netWorths = entries.map((entry) => entry.netWorth || 0);

  return {
    bestMonth,
    worstMonth,
    avgChange,
    avgChangePercent,
    highest: Math.max(...netWorths),
    lowest: Math.min(...netWorths),
  };
};
