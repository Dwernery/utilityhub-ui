import { ASSET_TYPES } from "./monthly";

// Account management helpers. Mirrors utility-hub-mobile's lib/finance/utils/accounts.ts.

const byTypeThenName = (a, b) =>
  (a.accountType || "").localeCompare(b.accountType || "") ||
  (a.accountName || "").localeCompare(b.accountName || "");

/**
 * Accounts for the Accounts list: active assets, active liabilities, then
 * every archived account (either category), each sorted by type, then name.
 */
export function groupAccounts(accounts = []) {
  const active = accounts.filter((a) => !a.archived);
  return {
    assets: active.filter((a) => a.category === "ASSET").sort(byTypeThenName),
    liabilities: active
      .filter((a) => a.category === "LIABILITY")
      .sort(byTypeThenName),
    archived: accounts.filter((a) => a.archived).sort(byTypeThenName),
  };
}

/**
 * Accounts that can be added to a month: this category, not archived, and not
 * already in the month (presentIds: the month's account ids).
 */
export function addableAccounts(accounts = [], category, presentIds) {
  return accounts.filter(
    (a) => a.category === category && !a.archived && !presentIds.has(a.id),
  );
}

/**
 * Type choices when editing an asset: the standard list, plus the account's
 * current type if it's a custom one, so saving doesn't quietly change it.
 */
export function assetTypeOptions(currentType) {
  return currentType && !ASSET_TYPES.includes(currentType)
    ? [...ASSET_TYPES, currentType]
    : [...ASSET_TYPES];
}
