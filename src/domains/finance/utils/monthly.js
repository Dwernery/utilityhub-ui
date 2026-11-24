import {
  getEntryAssets,
  getEntryLiabilities,
  MONTH_LABELS,
  PRIOR_YEAR_ENDING_BALANCES,
} from "./metrics";
import {
  byDate,
  isoMonth,
  isoYear,
  previousMonthIso,
} from "../../../lib/dates";

const monthYear = (date) =>
  `${MONTH_LABELS[isoMonth(date) - 1]} ${isoYear(date)}`;

// Monthly net-worth table and month detail. Mirrors utility-hub-mobile's
// lib/finance/utils/monthly.ts (which was itself ported from this app).

const pct = (change, prev) => (prev !== 0 ? (change / prev) * 100 : 0);

/**
 * The 12 rows of the dashboard's monthly table for `selectedYear`.
 * Each row: { key: "YYYY-MM", date, month, assets, liabilities, netWorth,
 * change, changePercent, hasData, isCurrentMonth }.
 * The current month is display-only: it isn't used as anyone's "previous".
 */
export function buildMonthlyRows(history, selectedYear, now = new Date()) {
  const all = history ?? [];
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const keyFor = (m) => `${selectedYear}-${String(m + 1).padStart(2, "0")}`;

  // Complete months of the selected year (current month excluded from calculations)
  const entries = all
    .filter(
      (e) =>
        !(
          isoYear(e.date) === currentYear && isoMonth(e.date) === currentMonth
        ) && isoYear(e.date) === selectedYear,
    )
    .sort(byDate);

  const rows = new Map();
  entries.forEach((entry, idx) => {
    const assets = getEntryAssets(entry);
    const liabilities = getEntryLiabilities(entry);
    const netWorth = entry.netWorth || assets - liabilities;
    const monthIndex = isoMonth(entry.date) - 1;

    let change = 0;
    let changePercent = 0;
    const prevEntry = entries[idx - 1];
    if (prevEntry) {
      const prev = prevEntry.netWorth || 0;
      change = netWorth - prev;
      changePercent = pct(change, prev);
    } else if (monthIndex === 0) {
      // January compares against last year's ending balance
      let prev = PRIOR_YEAR_ENDING_BALANCES[selectedYear];
      if (prev === undefined) {
        const prevYear = all
          .filter((e) => isoYear(e.date) === selectedYear - 1)
          .sort((a, b) => byDate(b, a));
        prev = prevYear[0]?.netWorth;
      }
      if (prev !== undefined) {
        change = netWorth - (prev || 0);
        changePercent = pct(change, prev || 0);
      }
    }

    rows.set(monthIndex, {
      key: keyFor(monthIndex),
      date: entry.date,
      month: MONTH_LABELS[monthIndex],
      assets,
      liabilities,
      netWorth,
      change,
      changePercent,
      hasData: true,
      isCurrentMonth: false,
    });
  });

  // Current month: display only, change vs. the last complete month
  if (selectedYear === currentYear) {
    const current = all
      .filter(
        (e) =>
          isoYear(e.date) === currentYear && isoMonth(e.date) === currentMonth,
      )
      .sort((a, b) => byDate(b, a))[0];
    if (current) {
      const assets = getEntryAssets(current);
      const liabilities = getEntryLiabilities(current);
      const netWorth = current.netWorth || assets - liabilities;
      const last = entries.at(-1);
      const prev = last?.netWorth || 0;
      const change = last ? netWorth - prev : 0;
      rows.set(currentMonth - 1, {
        key: keyFor(currentMonth - 1),
        date: current.date,
        month: MONTH_LABELS[currentMonth - 1],
        assets,
        liabilities,
        netWorth,
        change,
        changePercent: last ? pct(change, prev) : 0,
        hasData: true,
        isCurrentMonth: true,
      });
    }
  }

  return MONTH_LABELS.map((month, i) => {
    const existing = rows.get(i);
    if (existing) return existing;
    const isCurrent = selectedYear === currentYear && i === currentMonth - 1;
    return {
      key: keyFor(i),
      date: isCurrent ? `${keyFor(i)}-01` : null,
      month,
      assets: 0,
      liabilities: 0,
      netWorth: isCurrent ? 0 : null,
      change: null,
      changePercent: null,
      hasData: false,
      isCurrentMonth: isCurrent,
    };
  });
}

/**
 * The accounts in one month's snapshot, each with its change vs. the previous
 * calendar month (change/changePercent are null when it had no balance then).
 */
export function monthAccounts(history, date) {
  const all = history ?? [];
  const entry = all.find((e) => e.date === date);
  const prevDate = previousMonthIso(date);
  const prevBalances = new Map(
    (all.find((e) => e.date === prevDate)?.accounts ?? []).map((a) => [
      a.accountId,
      a.balance,
    ]),
  );

  const withChange = (a) => {
    const before = prevBalances.get(a.accountId);
    if (before === undefined)
      return { ...a, change: null, changePercent: null };
    const change = a.balance - before;
    return { ...a, change, changePercent: pct(change, before) };
  };

  const accounts = (entry?.accounts ?? []).map(withChange);
  const byType = (a, b) =>
    (a.accountType || "").localeCompare(b.accountType || "");
  const assets = accounts.filter((a) => a.category === "ASSET").sort(byType);
  const liabilities = accounts
    .filter((a) => a.category === "LIABILITY")
    .sort(byType);
  const totalAssets = assets.reduce((s, a) => s + (a.balance || 0), 0);
  const totalLiabilities = liabilities.reduce(
    (s, a) => s + (a.balance || 0),
    0,
  );

  return {
    hasData: accounts.length > 0,
    assets,
    liabilities,
    netWorth: entry?.netWorth ?? totalAssets - totalLiabilities,
  };
}

/**
 * The month a "copy last month" for `date` would copy from, or null when that
 * month has no account balances (nothing to copy, so offer no button).
 * Mirrors utility-hub-mobile's previousMonthToCopy.
 *
 * @returns {{ fromDate: string, label: string } | null}  label: "October 2026"
 */
export function previousMonthToCopy(history, date) {
  const fromDate = previousMonthIso(date);
  if (!monthAccounts(history, fromDate).hasData) return null;
  return { fromDate, label: monthYear(fromDate) };
}

/** The toast after a copy, from the API's { fromDate, copied }. */
export function copyResultMessage({ fromDate, copied }) {
  if (copied === 0) return "Every account already has a balance this month";
  return `Copied ${copied} balance${copied === 1 ? "" : "s"} from ${monthYear(fromDate)}`;
}

/**
 * Totals for the Income & Expenses page. Net cash flow counts only items marked
 * cash. Mirrors utility-hub-mobile's transactionTotals.
 */
export function transactionTotals(transactions = []) {
  const sum = (list) => list.reduce((total, t) => total + t.amount, 0);
  const income = sum(
    transactions.filter((t) => t.transactionType === "INCOME"),
  );
  const expenses = sum(
    transactions.filter((t) => t.transactionType === "EXPENSE"),
  );
  const netCashFlow =
    sum(transactions.filter((t) => t.transactionType === "INCOME" && t.cash)) -
    sum(transactions.filter((t) => t.transactionType === "EXPENSE" && t.cash));
  return { income, expenses, netCashFlow, netIncome: income - expenses };
}

/** Asset account types offered when creating an account (liabilities take free text). */
export const ASSET_TYPES = [
  "Cash & Savings",
  "Investments",
  "Retirement",
  "Property",
];
