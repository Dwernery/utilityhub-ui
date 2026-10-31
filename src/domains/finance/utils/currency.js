export const Currencyformatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

// Shortened form (e.g. $850K, $1.2M) for tight spaces like home card stat tiles
export const CompactCurrencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});
