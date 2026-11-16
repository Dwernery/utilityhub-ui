// Calendar dates in this app are "YYYY-MM-DD" strings (the API's LocalDate format).
// They have no time and no time zone, so never route them through new Date("YYYY-MM-DD"),
// which reads them as midnight UTC and can shift the day (or year) in local time.
// Likewise never build one with new Date().toISOString(), which gives the UTC date.
// Mirrors utility-hub-mobile's src/lib/dates.ts.

/** Parse `YYYY-MM-DD` as a local calendar date. Returns null for empty/invalid input. */
export const parseLocalDate = (dateStr) => {
  if (!dateStr) return null;
  const m = String(dateStr).match(/^(\d{4})-(\d{2})-(\d{2})(?:$|T)/);
  if (m) {
    return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  }
  const dt = new Date(dateStr);
  return Number.isNaN(dt.getTime()) ? null : dt;
};

/** `YYYY-MM-DD` → "Jan 5, 2026" (or "—" when missing). */
export const formatDate = (dateStr) => {
  const dt = parseLocalDate(dateStr);
  if (!dt) return "—";
  return dt.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

/** A local `Date` → `YYYY-MM-DD`. */
export const toIsoDate = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** Today's date where the user is, as `YYYY-MM-DD`. The one definition of "today". */
export const todayIso = () => toIsoDate(new Date());

/** The year of a `YYYY-MM-DD` string. */
export const isoYear = (iso) => Number(iso.slice(0, 4));

/** The month (1–12) of a `YYYY-MM-DD` string. */
export const isoMonth = (iso) => Number(iso.slice(5, 7));

/** The first day of the month before, as `YYYY-MM-01` ("2026-01-15" → "2025-12-01"). */
export const previousMonthIso = (iso) => {
  const year = isoYear(iso);
  const month = isoMonth(iso);
  return month === 1
    ? `${year - 1}-12-01`
    : `${year}-${String(month - 1).padStart(2, "0")}-01`;
};

/**
 * Whole calendar days from `startIso` to `endIso` (negative if end is earlier).
 * Counting in UTC means a 23- or 25-hour daylight-saving day still counts as one day.
 */
export const daysBetween = (startIso, endIso) => {
  const utc = (iso) =>
    Date.UTC(isoYear(iso), isoMonth(iso) - 1, Number(iso.slice(8, 10)));
  return Math.round((utc(endIso) - utc(startIso)) / 86_400_000);
};

/**
 * Sort comparators for `YYYY-MM-DD` strings (or objects with a `date`), oldest first.
 * The format sorts correctly as plain text, so no Date parsing is needed.
 */
export const compareIsoDates = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
export const byDate = (a, b) => compareIsoDates(a.date, b.date);
