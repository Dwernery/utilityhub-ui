import { Currencyformatter } from "./currency.js";

export const getCurrentNetWorth = (netWorthHistory) => {
  return netWorthHistory?.[Object.keys(netWorthHistory).at(-1)]?.netWorth;
};

export const getCurrentAssets = (netWorthHistory) => {
  let totalAssets = 0;
  netWorthHistory?.[Object.keys(netWorthHistory).at(-1)]?.accounts?.map(
    (account) => {
      if (account.category === "ASSET") {
        totalAssets += account.balance;
      }
    },
  );

  return Currencyformatter.format(totalAssets);
};

export const getCurrentLiabilities = (netWorthHistory) => {
  let totalLiabilities = 0;
  netWorthHistory?.[Object.keys(netWorthHistory).at(-1)]?.accounts?.map(
    (account) => {
      if (account.category === "LIABILITY") {
        totalLiabilities += account.balance;
      }
    },
  );

  return Currencyformatter.format(totalLiabilities);
};

export const getPrevYearNetWorthChange = (netWorthHistory) => {
  if (!netWorthHistory || Object.keys(netWorthHistory).length === 0) {
    return Currencyformatter.format(0);
  }

  const lastEntry = netWorthHistory?.[Object.keys(netWorthHistory).at(-1)];
  const currentYear = parseInt((lastEntry?.date || "").split("-")[0]);
  const prevYear = currentYear - 1;

  const prevYearDecEntry = Object.values(netWorthHistory).find((entry) => {
    const [year, month] = (entry?.date || "").split("-").slice(0, 2);
    return parseInt(year) === prevYear && parseInt(month) === 12;
  });

  const prevYearNetWorth = prevYearDecEntry?.netWorth || 0;
  return (
    netWorthHistory?.[Object.keys(netWorthHistory).at(-1)]?.netWorth -
    prevYearNetWorth
  );
};

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
