import {
  byDate,
  isoMonth,
  isoYear,
  previousMonthIso,
} from "../../../lib/dates";

/**
 * Numbers for the home page's Finances card. Mirrors utility-hub-mobile's
 * lib/finance/utils/homeSummary.ts (which was ported from this card).
 *
 * - netWorth: the latest *complete* month this year
 * - dollarChange / percentChange: vs. the previous year's December snapshot
 * - projectedNetWorth: latest snapshot + unpaid income − unpaid expenses
 * - accountChanges: non-liability accounts in the latest snapshot vs. the
 *   calendar month before it (change/percentChange null when it had none)
 */
export function financeHomeSummary(history, transactions, now = new Date()) {
  const all = history ?? [];
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const entriesForYear = all
    .filter((e) => isoYear(e.date) === currentYear)
    .sort(byDate);
  const fullMonths = entriesForYear.filter(
    (e) => isoMonth(e.date) !== currentMonth,
  );
  const latestFullMonthEntry = fullMonths.at(-1) ?? null;
  const latestEntry = entriesForYear.at(-1) ?? null;

  // Account changes vs. the calendar month directly before the latest snapshot
  let accountChanges = [];
  if (latestEntry?.accounts?.length) {
    const prevDate = previousMonthIso(latestEntry.date);
    const prevEntry = all.find((e) => e.date === prevDate);

    accountChanges = latestEntry.accounts
      .filter((a) => a.category !== "LIABILITY")
      .map((account) => {
        const prevAccount = prevEntry?.accounts?.find(
          (a) => a.accountId === account.accountId,
        );
        if (!prevAccount)
          return { ...account, change: null, percentChange: null };
        const prevBalance = prevAccount.balance || 0;
        const change = (account.balance || 0) - prevBalance;
        return {
          ...account,
          change,
          percentChange: prevBalance !== 0 ? (change / prevBalance) * 100 : 0,
        };
      });
  }

  if (!latestFullMonthEntry) {
    return {
      netWorth: 0,
      dollarChange: 0,
      percentChange: 0,
      projectedNetWorth: 0,
      projectedPercentChange: 0,
      accountChanges,
    };
  }

  const netWorth = latestFullMonthEntry.netWorth;
  const prevYearEnd = all.find((e) => e.date === `${currentYear - 1}-12-01`);
  const prevYearEndNetWorth = prevYearEnd?.netWorth || netWorth;
  const dollarChange = netWorth - prevYearEndNetWorth;
  const percentChange =
    prevYearEndNetWorth !== 0 ? (dollarChange / prevYearEndNetWorth) * 100 : 0;

  let unpaidIncome = 0;
  let unpaidExpenses = 0;
  for (const t of transactions ?? []) {
    if (t.paid) continue;
    if (t.transactionType === "INCOME") unpaidIncome += t.amount;
    else if (t.transactionType === "EXPENSE") unpaidExpenses += t.amount;
  }
  const projectedNetWorth =
    (latestEntry?.netWorth || netWorth) + unpaidIncome - unpaidExpenses;
  const projectedPercentChange =
    netWorth !== 0 ? ((projectedNetWorth - netWorth) / netWorth) * 100 : 0;

  return {
    netWorth,
    dollarChange,
    percentChange,
    projectedNetWorth,
    projectedPercentChange,
    accountChanges,
  };
}
