import { existsSync, readFileSync, writeFileSync } from "node:fs";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { addableAccounts, assetTypeOptions, groupAccounts } from "./accounts";
import { parseMoney } from "./currency";
import { financeHomeSummary } from "./homeSummary";
import {
  getIncomeYears,
  getIncomeYoY,
  getSourcesForYear,
  getYearTotal,
} from "./income";
import {
  getMonthlyChartData,
  getYearMetrics,
  getYears,
  getYearStats,
  MONTH_LABELS,
  PRIOR_YEAR_ENDING_BALANCES,
} from "./metrics";
import {
  ASSET_TYPES,
  buildMonthlyRows,
  copyResultMessage,
  monthAccounts,
  previousMonthToCopy,
  transactionTotals,
} from "./monthly";

// Runs shared-cases.json, the input → output cases utility-hub-mobile runs too
// (src/lib/finance/utils/shared-cases.test.ts), so the two ports can't drift.
// After an intended change in what a function returns, change it in both apps,
// then refresh the expected values with
//   SHARED_CASES_UPDATE=1 npx vitest run shared-cases
// which rewrites this copy and, when it's checked out next to this repo, the
// mobile copy. Review the diff before committing it.

const IMPLEMENTATIONS = {
  parseMoney,
  groupAccounts,
  addableAccounts,
  assetTypeOptions,
  getIncomeYears,
  getSourcesForYear,
  getYearTotal,
  getIncomeYoY,
  getYears,
  getMonthlyChartData,
  getYearMetrics,
  getYearStats,
  buildMonthlyRows,
  monthAccounts,
  previousMonthToCopy,
  copyResultMessage,
  transactionTotals,
  financeHomeSummary,
};
const CONSTANTS = { ASSET_TYPES, MONTH_LABELS, PRIOR_YEAR_ENDING_BALANCES };

const casesPath = fileURLToPath(
  new URL("./shared-cases.json", import.meta.url),
);
const mobileCopyPath = fileURLToPath(
  new URL(
    "../../../../../utility-hub-mobile/src/lib/finance/utils/shared-cases.json",
    import.meta.url,
  ),
);
const file = JSON.parse(readFileSync(casesPath, "utf8"));
const updating = !!process.env.SHARED_CASES_UPDATE;

const resolve = (arg) => {
  if (arg && typeof arg === "object" && "$fixture" in arg)
    return structuredClone(file.fixtures[arg.$fixture]);
  if (arg && typeof arg === "object" && Array.isArray(arg.$set))
    return new Set(arg.$set);
  return structuredClone(arg);
};

// Compare as JSON (undefined is dropped, as it would be in the file), with
// numbers to 6 decimal places so float noise isn't drift.
const normalize = (value) =>
  JSON.parse(
    JSON.stringify(value ?? null, (_, v) =>
      typeof v === "number" ? Math.round(v * 1e6) / 1e6 : v,
    ),
  );

const run = ({ fn, args }) =>
  normalize(
    args === null ? CONSTANTS[fn] : IMPLEMENTATIONS[fn](...args.map(resolve)),
  );

describe("shared finance cases", () => {
  beforeAll(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(file.now));
  });
  afterAll(() => {
    vi.useRealTimers();
    if (!updating) return;
    for (const c of file.cases) c.expected = run(c);
    const out = `${JSON.stringify(file, null, 2)}\n`;
    writeFileSync(casesPath, out);
    if (existsSync(mobileCopyPath)) writeFileSync(mobileCopyPath, out);
  });

  it("knows every function in the file", () => {
    const unknown = file.cases
      .map((c) => c.fn)
      .filter((fn) => !(fn in IMPLEMENTATIONS) && !(fn in CONSTANTS));
    expect(unknown).toEqual([]);
  });

  it.skipIf(updating || !existsSync(mobileCopyPath))(
    "matches utility-hub-mobile's copy",
    () => {
      expect(JSON.parse(readFileSync(mobileCopyPath, "utf8"))).toEqual(file);
    },
  );

  it.skipIf(updating).each(file.cases.map((c) => [`${c.fn}: ${c.note}`, c]))(
    "%s",
    (_, c) => {
      expect(run(c)).toEqual(c.expected);
    },
  );
});
