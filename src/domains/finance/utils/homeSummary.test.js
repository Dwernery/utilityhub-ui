import { describe, it, expect } from "vitest";
import { financeHomeSummary } from "./homeSummary";

const account = (accountId, category, balance) => ({
  accountId,
  accountName: `Account ${accountId}`,
  accountType: "Cash & Savings",
  category,
  balance,
});
const entry = (date, netWorth, accounts = []) => ({
  date,
  netWorth,
  source: "account-based",
  accounts,
});
const tx = (transactionType, amount, paid) => ({
  id: amount,
  name: "x",
  amount,
  paid,
  cash: true,
  transactionType,
});

const now = new Date(2026, 10, 15); // 15 Nov 2026: November is in progress

const history = [
  entry("2025-12-01", 1000),
  entry("2026-09-01", 1100, [account(1, "ASSET", 400)]),
  entry("2026-10-01", 1200, [
    account(1, "ASSET", 500),
    account(2, "ASSET", 50),
    account(3, "LIABILITY", 30),
  ]),
  entry("2026-11-01", 1300, [account(1, "ASSET", 600)]),
];

describe("financeHomeSummary", () => {
  it("uses the latest complete month, compared with last December", () => {
    const s = financeHomeSummary(history, [], now);

    expect(s.netWorth).toBe(1200); // October, not the in-progress November
    expect(s.dollarChange).toBe(200);
    expect(s.percentChange).toBeCloseTo(20);
  });

  it("projects from the latest snapshot plus unpaid income minus unpaid expenses", () => {
    const s = financeHomeSummary(
      history,
      [
        tx("INCOME", 500, false),
        tx("EXPENSE", 100, false),
        tx("INCOME", 999, true),
      ],
      now,
    );

    expect(s.projectedNetWorth).toBe(1700); // 1300 + 500 - 100; paid items already counted
    expect(s.projectedPercentChange).toBeCloseTo((500 / 1200) * 100);
  });

  it("compares each non-liability account with the month before the latest snapshot", () => {
    const shuffled = [history[3], history[0], history[2], history[1]];
    const { accountChanges } = financeHomeSummary(shuffled, [], now);

    expect(accountChanges).toHaveLength(1); // November only has account 1
    expect(accountChanges[0]).toMatchObject({ accountId: 1, change: 100 }); // 600 vs October's 500
    expect(accountChanges[0].percentChange).toBeCloseTo(20);
  });

  it("reports a new account as having no change", () => {
    const { accountChanges } = financeHomeSummary(history.slice(0, 3), [], now);

    expect(accountChanges.map((a) => [a.accountId, a.change])).toEqual([
      [1, 100], // October 500 vs September 400
      [2, null], // didn't exist in September
    ]);
  });

  it("returns zeros before there is a complete month this year", () => {
    expect(financeHomeSummary(undefined, undefined, now)).toMatchObject({
      netWorth: 0,
      projectedNetWorth: 0,
      accountChanges: [],
    });
  });
});
